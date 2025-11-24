/**
 * Advanced Health Score Calculator for Albato
 * Implements sophisticated scoring algorithms for CSM workflows
 */

class HealthScoreCalculator {
  constructor(config = {}) {
    this.weights = config.weights || {
      engagement: 0.35,
      risk: 0.30,
      opportunity: 0.20,
      satisfaction: 0.15
    };
    
    this.thresholds = config.thresholds || {
      green: 70,
      amber: 40,
      red: 0
    };
    
    this.decayRates = config.decayRates || {
      engagement: 1.5,  // Points lost per day without contact
      satisfaction: 0.5  // NPS decay rate
    };
  }

  /**
   * Calculate comprehensive health score for an account
   */
  calculateScore(accountData) {
    const {
      account,
      meetings,
      risks,
      opportunities,
      tickets,
      surveys
    } = accountData;

    // Calculate component scores
    const engagementScore = this.calculateEngagementScore(meetings, account);
    const riskScore = this.calculateRiskScore(risks, account);
    const opportunityScore = this.calculateOpportunityScore(opportunities, account);
    const satisfactionScore = this.calculateSatisfactionScore(surveys, tickets);

    // Apply weights
    const totalScore = 
      (this.weights.engagement * engagementScore) +
      (this.weights.risk * riskScore) +
      (this.weights.opportunity * opportunityScore) +
      (this.weights.satisfaction * satisfactionScore);

    // Determine status and trending
    const status = this.determineStatus(totalScore);
    const trend = this.calculateTrend(account.previous_scores || [], totalScore);

    return {
      account_id: account.id,
      account_name: account.name,
      health_score: Math.round(totalScore),
      health_status: status,
      trend: trend,
      components: {
        engagement: Math.round(engagementScore),
        risk: Math.round(riskScore),
        opportunity: Math.round(opportunityScore),
        satisfaction: Math.round(satisfactionScore)
      },
      calculated_at: new Date().toISOString(),
      recommendations: this.generateRecommendations(totalScore, {
        engagementScore,
        riskScore,
        opportunityScore,
        satisfactionScore
      })
    };
  }

  /**
   * Calculate engagement score based on interaction frequency and quality
   */
  calculateEngagementScore(meetings, account) {
    if (!meetings || meetings.length === 0) {
      return 0;
    }

    // Sort meetings by date
    const sortedMeetings = meetings.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    const lastMeeting = sortedMeetings[0];
    const daysSinceContact = this.daysBetween(new Date(), new Date(lastMeeting.date));

    // Base score from recency
    let score = Math.max(0, 100 - (daysSinceContact * this.decayRates.engagement));

    // Bonus for regular cadence
    const meetingCadence = this.calculateMeetingCadence(sortedMeetings);
    if (meetingCadence <= 30) {
      score += 10; // Bonus for monthly or better cadence
    }

    // Bonus for executive engagement
    const execEngagement = meetings.filter(m => 
      m.attendees && m.attendees.toLowerCase().includes('executive')
    ).length;
    score += Math.min(15, execEngagement * 5);

    // Account tier multiplier
    if (account.tier === 'Enterprise') {
      score *= 1.1;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate risk score based on open risks and severity
   */
  calculateRiskScore(risks, account) {
    if (!risks || risks.length === 0) {
      return 100; // No risks is perfect score
    }

    const openRisks = risks.filter(r => r.status !== 'Closed');
    
    if (openRisks.length === 0) {
      return 100;
    }

    // Weight risks by severity
    const riskWeights = {
      'Critical': 30,
      'High': 20,
      'Medium': 10,
      'Low': 5
    };

    let totalRiskImpact = 0;
    openRisks.forEach(risk => {
      const weight = riskWeights[risk.severity] || 10;
      const ageMultiplier = this.calculateRiskAge(risk.created_date);
      totalRiskImpact += weight * ageMultiplier;
    });

    // Calculate score (inverse of risk)
    const score = Math.max(0, 100 - totalRiskImpact);

    // Consider mitigation plans
    const mitigatedRisks = openRisks.filter(r => r.mitigation_plan).length;
    const mitigationBonus = (mitigatedRisks / openRisks.length) * 20;

    return Math.min(100, score + mitigationBonus);
  }

  /**
   * Calculate opportunity score based on pipeline value and probability
   */
  calculateOpportunityScore(opportunities, account) {
    if (!opportunities || opportunities.length === 0) {
      return 50; // Neutral score if no opportunities
    }

    const openOpps = opportunities.filter(o => 
      o.status !== 'Closed Lost' && o.status !== 'Closed Won'
    );

    if (openOpps.length === 0) {
      return 30; // Low score if no active opportunities
    }

    // Calculate weighted pipeline value
    let weightedValue = 0;
    let expansionValue = 0;
    
    openOpps.forEach(opp => {
      const probability = this.getStageProbability(opp.stage);
      const value = opp.value || 0;
      weightedValue += value * probability;
      
      if (opp.type === 'Expansion' || opp.type === 'Upsell') {
        expansionValue += value * probability;
      }
    });

    // Normalize against account ARR
    const arr = account.arr || 100000;
    const expansionRatio = expansionValue / arr;
    
    // Base score from expansion ratio
    let score = Math.min(100, expansionRatio * 200);

    // Bonus for multiple opportunities (diversification)
    if (openOpps.length > 1) {
      score += Math.min(20, openOpps.length * 5);
    }

    // Bonus for late-stage opportunities
    const lateStageOpps = openOpps.filter(o => 
      this.getStageProbability(o.stage) >= 0.7
    ).length;
    score += lateStageOpps * 10;

    return Math.min(100, score);
  }

  /**
   * Calculate satisfaction score from surveys and support tickets
   */
  calculateSatisfactionScore(surveys, tickets) {
    let score = 70; // Default neutral score

    // NPS Score component
    if (surveys && surveys.length > 0) {
      const recentSurveys = surveys.filter(s => 
        this.daysBetween(new Date(), new Date(s.date)) <= 180
      );

      if (recentSurveys.length > 0) {
        const avgNPS = recentSurveys.reduce((sum, s) => sum + (s.nps_score || 0), 0) / recentSurveys.length;
        
        // Convert NPS (-100 to 100) to 0-100 scale
        score = ((avgNPS + 100) / 200) * 100;
      }
    }

    // Support ticket component
    if (tickets && tickets.length > 0) {
      const recentTickets = tickets.filter(t => 
        this.daysBetween(new Date(), new Date(t.created_date)) <= 90
      );

      // Penalize for high ticket volume
      const ticketPenalty = Math.min(30, recentTickets.length * 3);
      score -= ticketPenalty;

      // Bonus for resolved tickets
      const resolvedTickets = recentTickets.filter(t => t.status === 'Resolved').length;
      const resolutionRate = recentTickets.length > 0 ? resolvedTickets / recentTickets.length : 0;
      score += resolutionRate * 20;

      // Penalize for critical unresolved tickets
      const criticalOpen = recentTickets.filter(t => 
        t.priority === 'Critical' && t.status !== 'Resolved'
      ).length;
      score -= criticalOpen * 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Helper function to determine health status
   */
  determineStatus(score) {
    if (score >= this.thresholds.green) return 'Green';
    if (score >= this.thresholds.amber) return 'Amber';
    return 'Red';
  }

  /**
   * Calculate trend based on historical scores
   */
  calculateTrend(previousScores, currentScore) {
    if (!previousScores || previousScores.length < 2) {
      return 'stable';
    }

    const recentScores = previousScores.slice(-5);
    const avgRecent = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
    
    const difference = currentScore - avgRecent;
    
    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  /**
   * Generate actionable recommendations based on scores
   */
  generateRecommendations(totalScore, componentScores) {
    const recommendations = [];

    // Engagement recommendations
    if (componentScores.engagementScore < 50) {
      recommendations.push({
        category: 'Engagement',
        priority: 'High',
        action: 'Schedule QBR or check-in call within next 7 days',
        impact: 'High'
      });
    }

    // Risk recommendations
    if (componentScores.riskScore < 60) {
      recommendations.push({
        category: 'Risk',
        priority: 'High',
        action: 'Review and create mitigation plans for open risks',
        impact: 'High'
      });
    }

    // Opportunity recommendations
    if (componentScores.opportunityScore < 40) {
      recommendations.push({
        category: 'Growth',
        priority: 'Medium',
        action: 'Identify expansion opportunities and schedule value review',
        impact: 'Medium'
      });
    }

    // Satisfaction recommendations
    if (componentScores.satisfactionScore < 50) {
      recommendations.push({
        category: 'Satisfaction',
        priority: 'High',
        action: 'Conduct satisfaction survey and address open tickets',
        impact: 'High'
      });
    }

    // Overall recommendations
    if (totalScore < 40) {
      recommendations.push({
        category: 'Account',
        priority: 'Critical',
        action: 'Escalate to management and create recovery plan',
        impact: 'Critical'
      });
    }

    return recommendations;
  }

  /**
   * Utility functions
   */
  
  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
  }

  calculateMeetingCadence(meetings) {
    if (meetings.length < 2) return 999;
    
    let totalDays = 0;
    for (let i = 1; i < Math.min(meetings.length, 5); i++) {
      const days = this.daysBetween(
        new Date(meetings[i-1].date),
        new Date(meetings[i].date)
      );
      totalDays += days;
    }
    
    return totalDays / (Math.min(meetings.length, 5) - 1);
  }

  calculateRiskAge(createdDate) {
    const age = this.daysBetween(new Date(), new Date(createdDate));
    
    if (age < 7) return 1;
    if (age < 30) return 1.2;
    if (age < 60) return 1.5;
    return 2;
  }

  getStageProbability(stage) {
    const probabilities = {
      'Prospecting': 0.1,
      'Qualification': 0.2,
      'Proposal': 0.4,
      'Negotiation': 0.7,
      'Closed Won': 1,
      'Closed Lost': 0
    };
    
    return probabilities[stage] || 0.3;
  }
}

// Export for use in Albato Code blocks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HealthScoreCalculator;
}

// Albato-specific wrapper function
function calculateHealthScore(inputData) {
  const calculator = new HealthScoreCalculator();
  
  // Process multiple accounts if provided
  if (Array.isArray(inputData.accounts)) {
    return inputData.accounts.map(accountData => 
      calculator.calculateScore(accountData)
    );
  }
  
  // Process single account
  return calculator.calculateScore(inputData);
}
