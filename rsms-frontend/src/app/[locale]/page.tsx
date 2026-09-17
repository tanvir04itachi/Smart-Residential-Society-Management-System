import Image from 'next/image';
import { ArrowRight, BarChart3, BellRing, CheckCircle2, ClipboardList, CreditCard, HeartHandshake, House, ShieldCheck, Sparkles, UsersRound, Wrench } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const roles = [
  { key: 'manager', icon: BarChart3, color: 'bg-[#eeeaff] text-[#6655c5]' },
  { key: 'resident', icon: House, color: 'bg-[#e9f8f2] text-[#14745e]' },
  { key: 'guard', icon: ShieldCheck, color: 'bg-[#fff2df] text-[#b78345]' },
  { key: 'maintenance', icon: Wrench, color: 'bg-[#ffe9ed] text-[#c94b59]' },
  { key: 'accountant', icon: CreditCard, color: 'bg-[#e8f2ff] text-[#3972b8]' },
] as const;

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <main className="landing-gradient min-h-screen overflow-hidden text-slate-900">
      <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center"><Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={168} height={45} priority /></Link>
          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex"><a href="#how-it-works" className="transition hover:text-[#5949b6]">{t('explore')}</a><a href="#contact" className="transition hover:text-[#5949b6]">{t('contactUs')}</a></div>
          <div className="flex items-center gap-1"><ThemeToggle /><Link href="/login" className="btn h-10 rounded-xl border-0 bg-[#6655c5] px-4 text-sm text-white shadow-md shadow-[#6655c5]/20 hover:bg-[#5544af]">Login <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-28 lg:pt-20">
        <div className="relative z-10"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8d1ff] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#6655c5]"><Sparkles className="h-3.5 w-3.5" /> {t('eyebrow')}</div><h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">{t('title')}</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">{t('subtitle')}</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/login" className="btn h-12 rounded-xl border-0 bg-[#6655c5] px-6 text-white shadow-lg shadow-[#6655c5]/25 hover:bg-[#5544af]">{t('getStarted')} <ArrowRight className="h-4 w-4" /></Link><a href="#how-it-works" className="btn h-12 rounded-xl border border-slate-300 bg-white/70 px-6 text-slate-700 hover:border-[#8c7ce2] hover:bg-white">{t('explore')}</a></div><div className="mt-8 flex items-center gap-3 text-sm font-medium text-slate-500"><span className="flex -space-x-2"><span className="h-8 w-8 rounded-full border-2 border-white bg-[#f0b7b7]" /><span className="h-8 w-8 rounded-full border-2 border-white bg-[#b9d8c9]" /><span className="h-8 w-8 rounded-full border-2 border-white bg-[#c5bbf2]" /></span> {t('trusted')}</div></div>
        <div className="relative min-h-[390px] sm:min-h-[500px]"><div className="absolute -right-10 top-2 h-64 w-64 rounded-full bg-[#bfb4ff]/50 blur-3xl" /><div className="absolute -bottom-8 left-0 h-48 w-48 rounded-full bg-[#a9e4ce]/60 blur-3xl" /><div className="relative h-[390px] overflow-hidden rounded-[2rem] border-8 border-white/70 bg-white shadow-[0_24px_80px_rgba(42,35,86,0.18)] sm:h-[500px]"><Image src="/community-hero.png" alt="Residents connecting in a welcoming residential community" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" /><div className="absolute inset-0 bg-gradient-to-t from-[#33245f]/45 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl border border-white/30 bg-white/20 p-4 text-white backdrop-blur-md"><div><Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={96} height={26} className="brightness-0 invert opacity-90" /><p className="mt-1 text-sm font-bold">A more connected place to live</p></div><HeartHandshake className="h-7 w-7 text-[#c7f4df]" /></div></div></div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-white/60 px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6655c5]">Simple by design</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('howTitle')}</h2><p className="mt-4 text-base leading-7 text-slate-600">{t('howSubtitle')}</p></div><div className="mt-12 grid gap-5 md:grid-cols-3">{[{ icon: UsersRound, title: t('stepOne'), text: t('stepOneText'), tone: 'bg-[#eeeaff] text-[#6655c5]' }, { icon: ClipboardList, title: t('stepTwo'), text: t('stepTwoText'), tone: 'bg-[#e9f8f2] text-[#14745e]' }, { icon: BellRing, title: t('stepThree'), text: t('stepThreeText'), tone: 'bg-[#fff2df] text-[#b78345]' }].map((step, index) => <div key={step.title} className="lift-on-hover rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(42,35,86,0.05)]"><div className={`mb-8 flex h-12 w-12 items-center justify-center rounded-2xl ${step.tone}`}><step.icon className="h-5 w-5" /></div><p className="mb-2 text-xs font-bold text-slate-400">0{index + 1}</p><h3 className="text-lg font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p></div>)}</div></div></section>

      <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-2xl text-center"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#14745e]">One home base</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('rolesTitle')}</h2></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{roles.map((role) => { const Icon = role.icon; return <div key={role.key} className="lift-on-hover rounded-2xl border border-white/80 bg-white/75 p-5 text-center shadow-sm"><div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${role.color}`}><Icon className="h-5 w-5" /></div><p className="font-bold text-slate-800">{t(role.key)}</p><div className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-slate-400"><CheckCircle2 className="h-3.5 w-3.5 text-[#84cbb1]" /> Connected</div></div>; })}</div></div></section>

      <section id="contact" className="scroll-mt-20 px-5 pb-16 lg:px-8 lg:pb-24"><div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#6655c5] px-6 py-12 text-white shadow-xl shadow-[#6655c5]/20 sm:px-10 lg:px-16 lg:py-16"><div className="relative z-10 max-w-2xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#dcd6ff]">Start a conversation</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('contactTitle')}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#e7e3ff]">{t('contactText')}</p><a href="mailto:hello@rsms.app" className="btn mt-8 rounded-xl border-0 bg-white text-[#5949b6] hover:bg-[#f3f0ff]">{t('contactUs')} <ArrowRight className="h-4 w-4" /></a></div><div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[34px] border-[#8d80df]/40" /><div className="absolute -bottom-32 right-28 h-64 w-64 rounded-full bg-[#84cbb1]/30 blur-3xl" /></div></section>

      <footer className="border-t border-white/70 bg-white/45 px-5 py-7 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><Image src="/rsms-logo.svg" alt="RSMS Resident Hub" width={126} height={34} /><p>{t('footer')}</p><Link href="/login" className="font-semibold text-[#6655c5] hover:underline">Login <ArrowRight className="inline h-3.5 w-3.5" /></Link></div></footer>
    </main>
  );
}
