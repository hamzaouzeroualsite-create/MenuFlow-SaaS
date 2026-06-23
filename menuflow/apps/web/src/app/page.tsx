'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  QrCode, ShoppingBag, BarChart3, Users, Calendar, Sparkles,
  ArrowRight, Check, Star, Globe, Zap, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: QrCode, title: 'Menu Digital QR', desc: 'Créez un menu interactif accessible via QR Code en quelques minutes.' },
  { icon: ShoppingBag, title: 'Commandes Temps Réel', desc: 'Recevez et gérez les commandes instantanément avec notifications sonores.' },
  { icon: BarChart3, title: 'Analytics Avancés', desc: 'Suivez vos ventes, produits populaires et heures de pointe.' },
  { icon: Users, title: 'CRM Clients', desc: 'Fidélisez vos clients avec points de fidélité et segmentation.' },
  { icon: Calendar, title: 'Réservations', desc: 'Gérez les réservations avec calendrier et attribution de tables.' },
  { icon: Sparkles, title: 'IA Intégrée', desc: 'Descriptions automatiques, analyses prédictives et chatbot client.' },
];

const plans = [
  { name: 'Gratuit', price: '0', features: ['20 produits', '5 tables', 'Menu QR', '2 employés'] },
  { name: 'Starter', price: '299', features: ['100 produits', '20 tables', 'Analytics', 'Réservations', '5 employés'], popular: false },
  { name: 'Premium', price: '599', features: ['500 produits', '50 tables', 'IA', 'CRM', 'Multi-langue', '15 employés'], popular: true },
  { name: 'Enterprise', price: '1299', features: ['Illimité', 'Multi-restaurants', 'API dédiée', 'White label', 'Support prioritaire'], popular: false },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Menu<span className="text-emerald-600">Flow</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-emerald-600">Fonctionnalités</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-600">Tarifs</a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-emerald-600">Connexion</Link>
            <Link href="/login">
              <Button>Espace restaurant</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              La solution #1 pour les restaurants au Maroc
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Digitalisez votre restaurant<br />
              <span className="text-gradient">en quelques minutes</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Menu digital via QR Code, commandes en temps réel, réservations, analytics et paiements.
              Tout ce dont votre restaurant a besoin, en une seule plateforme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu/le-riad-casablanca">
                <Button size="lg" className="gap-2">
                  <QrCode className="w-4 h-4" /> Voir une démo menu
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2">
                  Espace restaurant <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              Plateforme sur invitation — contactez MenuFlow pour rejoindre
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-3xl mx-auto"
          >
            {[
              { value: '500+', label: 'Restaurants' },
              { value: '50K+', label: 'Commandes/mois' },
              { value: '99.9%', label: 'Disponibilité' },
              { value: '4.9', label: 'Note moyenne', icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.icon && <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tout pour votre restaurant</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Une plateforme complète pensée pour les restaurateurs marocains</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifs simples et transparents</h2>
            <p className="text-gray-600">Commencez gratuitement, évoluez quand vous êtes prêt</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-6 border-2 ${plan.popular ? 'border-emerald-500 shadow-lg relative' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                    Populaire
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500"> MAD/mois</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <Button variant={plan.popular ? 'default' : 'outline'} className="w-full">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <Globe className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à transformer votre restaurant ?</h2>
          <p className="text-emerald-100 mb-8 text-lg">Rejoignez des centaines de restaurants au Maroc qui utilisent MenuFlow</p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="gap-2">
              Espace restaurant <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-emerald flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">MenuFlow</span>
          </div>
          <p className="text-sm text-gray-500">&copy; 2026 MenuFlow. Tous droits réservés. Made in Morocco 🇲🇦</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" /> Sécurisé &amp; conforme
          </div>
        </div>
      </footer>
    </div>
  );
}
