<script setup>
import { useI18n } from 'vue-i18n'
import { useGlobalState } from '../store'
const { openSettings } = useGlobalState()


const { t } = useI18n({
    messages: {
        en: {
            copyright: "Copyright"
        },
        zh: {
            copyright: "版权所有"
        }
    }
});

</script>

<template>
    <div class="footer-shell">
        <n-divider class="footer-divider" />
        <div class="footer-inner">
            <n-space justify="center" align="center">
                <n-text depth="3">
                    {{ t('copyright') }} © 2023-{{ new Date().getFullYear() }}
                </n-text>
                <n-text depth="3">
                    <div v-html="openSettings.copyright"></div>
                </n-text>
            </n-space>
        </div>
    </div>
</template>


<style scoped>
.footer-shell {
    margin-top: 12px;
}

.footer-divider {
    margin: 0;
    opacity: 0.64;
}

.footer-inner {
    text-align: center;
    padding: 14px 12px 10px;
    border-radius: 16px;
    border: 1px solid var(--glass-border);
    background:
        linear-gradient(148deg, var(--glass-top) 0%, var(--glass-bottom) 100%);
    backdrop-filter: blur(14px) saturate(165%);
    box-shadow: 0 14px 38px -32px rgba(41, 69, 129, 0.75);
}

.footer-inner :deep(.n-text) {
    color: var(--text-muted);
}
</style>
