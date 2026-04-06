<script setup>
import { darkTheme, NGlobalStyle, zhCN } from 'naive-ui'
import { computed, onMounted } from 'vue'
import { useScript } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { useGlobalState } from './store'
import { useIsMobile } from './utils/composables'
import Header from './views/Header.vue';
import Footer from './views/Footer.vue';
import { api } from './api'

const {
  isDark, loading, useSideMargin, telegramApp, isTelegram
} = useGlobalState()
const adClient = import.meta.env.VITE_GOOGLE_AD_CLIENT;
const adSlot = import.meta.env.VITE_GOOGLE_AD_SLOT;
const { locale } = useI18n({});
const theme = computed(() => isDark.value ? darkTheme : null)
const localeConfig = computed(() => locale.value == 'zh' ? zhCN : null)
const themeClass = computed(() => isDark.value ? 'theme-dark' : 'theme-light')
const themeOverrides = computed(() => ({
  common: {
    primaryColor: isDark.value ? '#7DD3FC' : '#0EA5E9',
    primaryColorHover: isDark.value ? '#BAE6FD' : '#0284C7',
    primaryColorPressed: isDark.value ? '#38BDF8' : '#0369A1',
    infoColor: isDark.value ? '#93C5FD' : '#2563EB',
    successColor: isDark.value ? '#86EFAC' : '#16A34A',
    borderRadius: '14px',
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif',
  },
  Button: {
    heightMedium: '44px',
    borderRadiusMedium: '12px',
    fontWeight: '650',
  },
  Card: {
    borderRadius: '18px',
  },
  Input: {
    heightMedium: '44px',
    borderRadius: '12px',
  },
  Tabs: {
    tabBorderRadius: '12px',
  },
}));
const isMobile = useIsMobile()
const showSideMargin = computed(() => !isMobile.value && useSideMargin.value);
const showAd = computed(() => !isMobile.value && adClient && adSlot);
const gridMaxCols = computed(() => showAd.value ? 8 : 12);

// Load Google Ad script at top level (not inside onMounted)
if (showAd.value) {
  useScript({
    src: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`,
    async: true,
    crossorigin: "anonymous",
  })
}

onMounted(async () => {
  try {
    await api.getUserSettings();
  } catch (error) {
    console.error(error);
  }

  const token = import.meta.env.VITE_CF_WEB_ANALY_TOKEN;

  const exist = document.querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]') !== null
  if (token && !exist) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.dataset.cfBeacon = `{ token: ${token} }`;
    document.body.appendChild(script);
  }

  // check if google ad is enabled
  if (showAd.value) {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }


  // check if telegram is enabled
  const enableTelegram = import.meta.env.VITE_IS_TELEGRAM;
  if (
    (typeof enableTelegram === 'boolean' && enableTelegram === true)
    ||
    (typeof enableTelegram === 'string' && enableTelegram === 'true')
  ) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js';
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    telegramApp.value = window.Telegram?.WebApp || {};
    isTelegram.value = !!window.Telegram?.WebApp?.initData;
  }
});
</script>

<template>
  <n-config-provider :locale="localeConfig" :theme="theme" :theme-overrides="themeOverrides">
    <n-global-style />
    <n-spin description="loading..." :show="loading">
      <n-notification-provider container-style="margin-top: 60px;">
        <n-message-provider container-style="margin-top: 20px;">
          <div class="app-shell" :class="themeClass">
            <div class="ambient ambient-a"></div>
            <div class="ambient ambient-b"></div>
            <div class="ambient ambient-c"></div>
            <div class="ambient ambient-d"></div>
            <n-grid x-gap="16" :cols="gridMaxCols">
            <n-gi v-if="showSideMargin" span="1">
              <div class="side" v-if="showAd">
                <ins class="adsbygoogle" style="display:block" :data-ad-client="adClient" :data-ad-slot="adSlot"
                  data-ad-format="auto" data-full-width-responsive="true"></ins>
              </div>
            </n-gi>
            <n-gi :span="!showSideMargin ? gridMaxCols : (gridMaxCols - 2)">
              <div class="main">
                <n-space vertical>
                  <n-layout class="content-layout">
                    <Header />
                    <router-view></router-view>
                  </n-layout>
                  <Footer />
                </n-space>
              </div>
            </n-gi>
            <n-gi v-if="showSideMargin" span="1">
              <div class="side" v-if="showAd">
                <ins class="adsbygoogle" style="display:block" :data-ad-client="adClient" :data-ad-slot="adSlot"
                  data-ad-format="auto" data-full-width-responsive="true"></ins>
              </div>
            </n-gi>
            </n-grid>
          </div>
          <n-back-top />
        </n-message-provider>
      </n-notification-provider>
    </n-spin>
  </n-config-provider>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

body {
  font-family: "Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", sans-serif;
  margin: 0;
}

.n-input:focus-within,
.n-select:focus-within,
.n-button:focus-visible,
.n-base-selection:focus-within {
  outline: 2px solid rgba(8, 145, 178, 0.35);
  outline-offset: 2px;
}

.n-switch {
  margin-left: 10px;
  margin-right: 10px;
}
</style>

<style scoped>
.side {
  min-height: 100vh;
}

.main {
  min-height: 100vh;
  padding: 20px 0 24px;
  position: relative;
  z-index: 2;
}

.content-layout {
  min-height: calc(100vh - 132px);
  padding: 16px 16px 22px;
  border-radius: 26px;
  border: 1px solid var(--glass-border);
  background:
    linear-gradient(136deg, var(--glass-top) 0%, var(--glass-bottom) 100%);
  backdrop-filter: blur(24px) saturate(180%);
  box-shadow: var(--glass-shadow);
  position: relative;
  overflow: hidden;
}

.content-layout::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    radial-gradient(120% 70% at -10% -20%, rgba(255, 255, 255, 0.58), transparent 55%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.34) 0%, transparent 28%);
  pointer-events: none;
}

.app-shell {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  transition: background 260ms ease;
}

.app-shell.theme-light {
  --text-strong: #07102a;
  --text-muted: #3b4a66;
  --glass-border: rgba(255, 255, 255, 0.7);
  --glass-top: rgba(255, 255, 255, 0.68);
  --glass-bottom: rgba(217, 231, 255, 0.28);
  --glass-shadow: 0 28px 60px -34px rgba(24, 55, 125, 0.55);
  color: var(--text-strong);
  background:
    radial-gradient(circle at 12% 16%, rgba(214, 234, 255, 0.92) 0%, transparent 36%),
    radial-gradient(circle at 92% -10%, rgba(227, 238, 255, 0.9) 0%, transparent 42%),
    linear-gradient(160deg, #f4f8ff 0%, #edf4ff 44%, #e6eefc 100%);
}

.app-shell.theme-dark {
  --text-strong: #ecf3ff;
  --text-muted: #b9c8e5;
  --glass-border: rgba(186, 218, 255, 0.22);
  --glass-top: rgba(29, 43, 72, 0.62);
  --glass-bottom: rgba(18, 26, 45, 0.48);
  --glass-shadow: 0 28px 58px -30px rgba(0, 0, 0, 0.75);
  color: var(--text-strong);
  background:
    radial-gradient(circle at 14% 10%, rgba(66, 110, 188, 0.4) 0%, transparent 34%),
    radial-gradient(circle at 100% 0%, rgba(86, 122, 219, 0.3) 0%, transparent 40%),
    linear-gradient(160deg, #080d1e 0%, #0d162b 45%, #0a1224 100%);
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(48px);
  pointer-events: none;
  opacity: 0.72;
  animation-duration: 7.8s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.app-shell.theme-dark .ambient {
  opacity: 0.36;
}

.ambient-a {
  width: 320px;
  height: 320px;
  background: #9fc0ff;
  top: -84px;
  left: -70px;
  animation-name: drift-a;
}

.ambient-b {
  width: 300px;
  height: 300px;
  background: #b2d6ff;
  bottom: -90px;
  right: -60px;
  animation-name: drift-b;
}

.ambient-c {
  width: 220px;
  height: 220px;
  background: #d4e6ff;
  left: 38%;
  top: 12%;
  animation-name: drift-c;
}

.ambient-d {
  width: 180px;
  height: 180px;
  background: #adc4ff;
  right: 24%;
  bottom: 18%;
  animation-name: drift-d;
}

@keyframes drift-a {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(18px, 10px, 0); }
}

@keyframes drift-b {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-14px, -16px, 0); }
}

@keyframes drift-c {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(16px, -10px, 0); }
}

@keyframes drift-d {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-12px, 14px, 0); }
}

.app-shell :deep(.n-button) {
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 180ms ease, background-color 180ms ease;
}

.app-shell :deep(.n-button:not(.n-button--disabled):hover) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px -18px rgba(36, 85, 168, 0.75);
}

@media (max-width: 768px) {
  .main {
    padding: 10px 0 18px;
  }

  .content-layout {
    min-height: calc(100vh - 96px);
    border-radius: 16px;
    padding: 10px 10px 16px;
  }

  .ambient-c,
  .ambient-d {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-shell :deep(.n-button) {
    transition: none;
  }

  .app-shell :deep(.n-button:not(.n-button--disabled):hover) {
    transform: none;
    box-shadow: none;
  }

  .ambient {
    animation: none;
    filter: blur(34px);
  }
}
</style>
