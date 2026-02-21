<script lang="ts">
  import { Database, Shield, Zap, Globe, ArrowRight, Hexagon } from 'lucide-svelte';
  
  const features = [
    {
      icon: Database,
      title: 'Edge Database',
      description: 'Cloudflare D1 with global replication for lightning-fast queries at the edge'
    },
    {
      icon: Shield,
      title: 'Secure Auth',
      description: 'Session-based authentication with Google OAuth and passwordless options'
    },
    {
      icon: Zap,
      title: 'Fast by Default',
      description: 'SvelteKit 2.x with Vite for rapid development and optimal performance'
    },
    {
      icon: Globe,
      title: 'Global Scale',
      description: 'Deploy to Cloudflare Pages with edge functions running worldwide'
    }
  ];
</script>

<div class="min-h-screen flex flex-col">
  <!-- Hero Section -->
  <section class="relative flex-1 flex items-center justify-center pt-20 pb-32 px-4 overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-3xl" style="background-color: var(--accent-bg); opacity: 0.5;"></div>
      <div class="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full blur-3xl" style="background-color: var(--error-bg); opacity: 0.3;"></div>
    </div>
    
    <div class="container-tight relative z-10">
      <div class="text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 animate-fade-in" style="background-color: var(--bg-secondary); border: 1px solid var(--border-primary);">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: var(--accent-primary);"></span>
          <span class="text-xs font-medium uppercase tracking-wider" style="color: var(--text-tertiary);">Now Available</span>
        </div>
        
        <!-- Headline -->
        <h1 class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-fade-in-up" style="animation-delay: 0.1s">
          <span style="color: var(--text-primary);">Build at the</span>
          <br />
          <span class="text-gradient">speed of thought</span>
        </h1>
        
        <!-- Subheadline -->
        <p class="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style="animation-delay: 0.2s; color: var(--text-secondary);">
          A refined starter kit for modern web applications. 
          Built with SvelteKit, Cloudflare D1, and a touch of elegance.
        </p>
        
        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style="animation-delay: 0.3s">
          <a href="/register" class="btn-primary w-full sm:w-auto">
            Get Started
            <ArrowRight class="w-4 h-4" />
          </a>
          <a href="/login" class="btn-secondary w-full sm:w-auto">
            Sign In
          </a>
        </div>
        
        <!-- Tech Stack -->
        <div class="flex flex-wrap items-center justify-center gap-2 text-sm animate-fade-in" style="animation-delay: 0.4s; color: var(--text-muted);">
          <span>SvelteKit</span>
          <span style="color: var(--border-secondary);">·</span>
          <span>TypeScript</span>
          <span style="color: var(--border-secondary);">·</span>
          <span>Tailwind</span>
          <span style="color: var(--border-secondary);">·</span>
          <span>Drizzle</span>
          <span style="color: var(--border-secondary);">·</span>
          <span>D1</span>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Features Section -->
  <section class="section" style="border-top: 1px solid var(--border-primary);">
    <div class="container-tight">
      <div class="text-center mb-16">
        <h2 class="font-display text-2xl sm:text-3xl md:text-4xl mb-4" style="color: var(--text-primary);">
          Everything you need
        </h2>
        <p class="max-w-lg mx-auto" style="color: var(--text-secondary);">
          Carefully selected tools and patterns for building production-ready applications
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each features as feature, i}
          {@const Icon = feature.icon}
          <div 
            class="group p-6 rounded-2xl transition-all duration-300"
            style="background-color: var(--bg-card); border: 1px solid var(--border-primary); animation-delay: {i * 0.1}s;"
          >
            <div class="flex items-start gap-4">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300" style="background-color: var(--bg-tertiary);">
                <Icon class="w-5 h-5 transition-colors duration-300" style="color: var(--text-secondary);" />
              </div>
              <div>
                <h3 class="font-display font-semibold mb-1" style="color: var(--text-primary);">
                  {feature.title}
                </h3>
                <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
  
  <!-- Quick Start Section -->
  <section class="section" style="border-top: 1px solid var(--border-primary);">
    <div class="container-tight">
      <div class="card-elevated p-8 sm:p-12">
        <div class="max-w-2xl mx-auto text-center mb-10">
          <h2 class="font-display text-2xl sm:text-3xl md:text-4xl mb-4" style="color: var(--text-primary);">
            Quick Start
          </h2>
          <p style="color: var(--text-secondary);">
            Get up and running in minutes
          </p>
        </div>
        
        <div class="rounded-xl p-6 font-mono text-sm" style="background-color: var(--bg-primary); border: 1px solid var(--border-primary);">
          <div class="space-y-3">
            <p>
              <span style="color: var(--text-muted);">$</span>
              <span style="color: var(--text-secondary);">git clone https://github.com/yourusername/sveltekit-starter.git</span>
            </p>
            <p>
              <span style="color: var(--text-muted);">$</span>
              <span style="color: var(--text-secondary);">cd sveltekit-starter && npm install</span>
            </p>
            <p>
              <span style="color: var(--text-muted);">$</span>
              <span style="color: var(--text-secondary);">cp .env.example .env</span>
            </p>
            <p>
              <span style="color: var(--text-muted);">$</span>
              <span style="color: var(--accent-primary);">npm run dev</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
