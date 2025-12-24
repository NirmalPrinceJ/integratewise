'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, Loader2, Sparkles, Shield, Zap, ArrowRight, Menu, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { Plan } from '@/lib/billing/types';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchPlans();
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      // Use fallback plans
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planCode: string) => {
    setSubscribing(planCode);
    
    const org_id = 'demo-org-id';
    
    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id,
          plan_code: planCode,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        window.location.href = '/account/billing?subscription=success';
      } else {
        alert(`Subscription failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setSubscribing(null);
    }
  };

  const fallbackPlans: Plan[] = [
    {
      id: '1',
      code: 'starter',
      name: 'Starter',
      description: 'Perfect for individuals and small teams getting started.',
      price_cents: 0,
      currency: 'USD',
      interval: 'monthly',
      features: [
        { name: 'Up to 3 team members', included: true },
        { name: '5 integrations', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Email support', included: true },
        { name: 'Custom workflows', included: false },
        { name: 'API access', included: false },
      ],
      metadata: { trial_days: 14 }
    },
    {
      id: '2',
      code: 'pro-monthly',
      name: 'Pro',
      description: 'For growing teams that need more power and flexibility.',
      price_cents: 2900,
      currency: 'USD',
      interval: 'monthly',
      features: [
        { name: 'Unlimited team members', included: true },
        { name: 'Unlimited integrations', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom workflows', included: true },
        { name: 'API access', included: true },
      ],
      metadata: { recommended: true, trial_days: 14 }
    },
    {
      id: '3',
      code: 'pro-yearly',
      name: 'Pro',
      description: 'For growing teams that need more power and flexibility.',
      price_cents: 27840,
      currency: 'USD',
      interval: 'yearly',
      features: [
        { name: 'Unlimited team members', included: true },
        { name: 'Unlimited integrations', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Custom workflows', included: true },
        { name: 'API access', included: true },
      ],
      metadata: { recommended: true, trial_days: 14 }
    },
    {
      id: '4',
      code: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with complex requirements.',
      price_cents: 0,
      currency: 'USD',
      interval: 'monthly',
      features: [
        { name: 'Everything in Pro', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'SLA guarantee', included: true },
        { name: 'On-premise deployment', included: true },
        { name: 'Advanced security', included: true },
      ],
      metadata: { trial_days: 14 }
    }
  ];

  const formatPrice = (priceCents: number, currency: string, interval: string) => {
    const price = priceCents / 100;
    const currencySymbol = currency === 'INR' ? '₹' : '$';
    
    if (price === 0) {
      return (
        <>
          <span className="text-5xl font-bold">Free</span>
          <span className="text-base font-normal text-muted-foreground ml-2">forever</span>
        </>
      );
    }
    
    return (
      <>
        <span className="text-5xl font-bold">{currencySymbol}{price.toLocaleString()}</span>
        <span className="text-base font-normal text-muted-foreground">/{interval === 'yearly' ? 'year' : 'mo'}</span>
      </>
    );
  };

  const getFilteredPlans = () => {
    const activePlans = plans.length > 0 ? plans : fallbackPlans;
    return activePlans.filter(plan => {
      if (plan.code === 'starter') return true;
      if (plan.code === 'enterprise') return true;
      if (isYearly && plan.code === 'pro-yearly') return true;
      if (!isYearly && plan.code === 'pro-monthly') return true;
      return false;
    });
  };

  const getPlanIcon = (code: string) => {
    if (code === 'starter') return <Zap className="h-8 w-8 text-primary" />;
    if (code.includes('pro')) return <Sparkles className="h-8 w-8 text-primary" />;
    if (code === 'enterprise') return <Shield className="h-8 w-8 text-primary" />;
    return null;
  };

  const filteredPlans = getFilteredPlans();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border/50 shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">IntegrateWise</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/#integrations" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Integrations
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-foreground">
                Pricing
              </Link>
              <Link href="/#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Customers
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-sm">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="text-sm bg-primary hover:bg-primary/90 glow-green-subtle">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob delay-1000" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-up delay-100">
            <span className="text-foreground">Plans that</span>
            <br />
            <span className="gradient-text">grow with you</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up delay-200">
            Start free and scale as you grow. No hidden fees, no surprises.
            14-day free trial on all paid plans.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 animate-fade-up delay-300">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <span className={cn(
              "text-sm font-medium transition-colors",
              isYearly ? 'text-foreground' : 'text-muted-foreground'
            )}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Save 20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {filteredPlans.map((plan, index) => {
                const isRecommended = plan.metadata?.recommended === true;
                const isEnterprise = plan.code === 'enterprise';
                
                return (
                  <div 
                    key={plan.id}
                    className={cn(
                      "relative animate-fade-up",
                      index === 0 && "delay-100",
                      index === 1 && "delay-200",
                      index === 2 && "delay-300"
                    )}
                  >
                    <Card className={cn(
                      "relative p-8 h-full feature-card",
                      isRecommended 
                        ? "border-2 border-primary shadow-xl glow-green-subtle" 
                        : "border border-border"
                    )}>
                      {isRecommended && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground px-4 py-1 shadow-lg">
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      {/* Plan Header */}
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            {getPlanIcon(plan.code)}
                          </div>
                          <h3 className="text-2xl font-bold">{plan.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground min-h-[2.5rem]">
                          {plan.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          {formatPrice(plan.price_cents, plan.currency, plan.interval)}
                        </div>
                        {isYearly && plan.code.includes('pro') && plan.price_cents > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            ${(plan.price_cents / 100 / 12).toFixed(0)}/month billed annually
                          </p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <Button
                        className={cn(
                          "w-full mb-8 h-12",
                          isRecommended 
                            ? "bg-primary hover:bg-primary/90 glow-green-subtle" 
                            : ""
                        )}
                        size="lg"
                        variant={isRecommended ? 'default' : 'outline'}
                        onClick={() => handleSubscribe(plan.code)}
                        disabled={subscribing !== null}
                      >
                        {subscribing === plan.code ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting trial...
                          </>
                        ) : isEnterprise ? (
                          'Contact Sales'
                        ) : plan.price_cents === 0 ? (
                          'Get Started Free'
                        ) : (
                          `Start ${plan.metadata?.trial_days || 14}-day trial`
                        )}
                      </Button>

                      {/* Features List */}
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          What's included
                        </p>
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-3">
                            {feature.included ? (
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3 text-primary" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                <X className="h-3 w-3 text-muted-foreground/50" />
                              </div>
                            )}
                            <span className={cn(
                              "text-sm",
                              feature.included ? 'text-foreground' : 'text-muted-foreground/50'
                            )}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-secondary/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing and plans.
            </p>
          </div>
          
          <div className="grid gap-4">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes will be prorated based on your billing cycle."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit/debit cards through our secure payment gateway powered by Stripe."
              },
              {
                question: "What happens after my trial ends?",
                answer: "Your trial will automatically convert to a paid subscription. You'll receive a reminder before your trial ends, and you can cancel anytime."
              },
              {
                question: "Do you offer refunds?",
                answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund."
              },
              {
                question: "Is there a limit on team members?",
                answer: "The Starter plan supports up to 3 team members. Pro and Enterprise plans have unlimited team members."
              },
              {
                question: "Do you offer discounts for nonprofits?",
                answer: "Yes! We offer special pricing for nonprofits and educational institutions. Contact our sales team to learn more."
              }
            ].map((faq, index) => (
              <Card key={index} className="p-6 feature-card">
                <h3 className="font-semibold mb-2 text-lg">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
            {[
              { icon: "🔒", label: "256-bit SSL" },
              { icon: "✅", label: "GDPR Compliant" },
              { icon: "🛡️", label: "SOC 2 Type II" },
              { icon: "💳", label: "Secure Payments" }
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Still have <span className="gradient-text">questions?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Our team is here to help. Schedule a call and we'll walk you through 
            everything IntegrateWise can do for your business.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-base px-8 h-12 bg-primary hover:bg-primary/90 glow-green">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8 h-12">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">IntegrateWise</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} IntegrateWise. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
