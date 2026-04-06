<script setup>
import { defineAsyncComponent, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { useGlobalState } from '../store'
import { api } from '../api'
import { useIsMobile } from '../utils/composables'
import { FullscreenExitOutlined } from '@vicons/material'

import AddressBar from './index/AddressBar.vue';
import MailBox from '../components/MailBox.vue';
import SendBox from '../components/SendBox.vue';
import AutoReply from './index/AutoReply.vue';
import AccountSettings from './index/AccountSettings.vue';
import Appearance from './common/Appearance.vue';
import Webhook from './index/Webhook.vue';
import Attachment from './index/Attachment.vue';
import About from './common/About.vue';
import SimpleIndex from './index/SimpleIndex.vue';

const { loading, settings, openSettings, indexTab, globalTabplacement, useSimpleIndex } = useGlobalState()
const message = useMessage()
const route = useRoute()
const isMobile = useIsMobile()

const SendMail = defineAsyncComponent(() => {
  loading.value = true;
  return import('./index/SendMail.vue')
    .finally(() => loading.value = false);
});

const { t } = useI18n({
  messages: {
    en: {
      mailbox: 'Mail Box',
      sendbox: 'Send Box',
      sendmail: 'Send Mail',
      auto_reply: 'Auto Reply',
      accountSettings: 'Account Settings',
      appearance: 'Appearance',
      about: 'About',
      s3Attachment: 'S3 Attachment',
      saveToS3Success: 'save to s3 success',
      webhookSettings: 'Webhook Settings',
      query: 'Query',
      enterSimpleMode: 'Simple Mode',
    },
    zh: {
      mailbox: '收件箱',
      sendbox: '发件箱',
      sendmail: '发送邮件',
      auto_reply: '自动回复',
      accountSettings: '账户',
      appearance: '外观',
      about: '关于',
      s3Attachment: 'S3附件',
      saveToS3Success: '保存到s3成功',
      webhookSettings: 'Webhook 设置',
      query: '查询',
      enterSimpleMode: '极简模式',
    }
  }
});

const fetchMailData = async (limit, offset) => {
  if (mailIdQuery.value > 0) {
    const singleMail = await api.fetch(`/api/mail/${mailIdQuery.value}`);
    if (singleMail) return { results: [singleMail], count: 1 };
    return { results: [], count: 0 };
  }
  return await api.fetch(`/api/mails?limit=${limit}&offset=${offset}`);
};

const deleteMail = async (curMailId) => {
  await api.fetch(`/api/mails/${curMailId}`, { method: 'DELETE' });
};

const deleteSenboxMail = async (curMailId) => {
  await api.fetch(`/api/sendbox/${curMailId}`, { method: 'DELETE' });
};

const fetchSenboxData = async (limit, offset) => {
  return await api.fetch(`/api/sendbox?limit=${limit}&offset=${offset}`);
};

const saveToS3 = async (mail_id, filename, blob) => {
  try {
    const { url } = await api.fetch(`/api/attachment/put_url`, {
      method: 'POST',
      body: JSON.stringify({ key: `${mail_id}/${filename}` })
    });
    // upload to s3 by formdata
    const formData = new FormData();
    formData.append(filename, blob);
    await fetch(url, {
      method: 'PUT',
      body: formData
    });
    message.success(t('saveToS3Success'));
  } catch (error) {
    console.error(error);
    message.error(error.message || "save to s3 error");
  }
}

const mailBoxKey = ref("")
const mailIdQuery = ref("")
const showMailIdQuery = ref(false)

const queryMail = () => {
  mailBoxKey.value = Date.now();
}

watch(route, () => {
  if (!route.query.mail_id) {
    showMailIdQuery.value = false;
    mailIdQuery.value = "";
    queryMail();
  }
})

onMounted(() => {
  if (route.query.mail_id) {
    showMailIdQuery.value = true;
    mailIdQuery.value = route.query.mail_id;
    queryMail();
  }
})
</script>

<template>
  <div class="index-shell">
    <div v-if="useSimpleIndex">
      <SimpleIndex />
    </div>
    <div v-else>
      <AddressBar />
      <n-tabs class="workspace-tabs" v-if="settings.address" type="card" animated v-model:value="indexTab" :placement="globalTabplacement">
        <template #prefix v-if="!isMobile">
          <n-button class="mode-button" @click="useSimpleIndex = true" tertiary size="small">
            <template #icon>
              <n-icon>
                <FullscreenExitOutlined />
              </n-icon>
            </template>
            {{ t('enterSimpleMode') }}
          </n-button>
        </template>
        <n-tab-pane name="mailbox" :tab="t('mailbox')">
          <div v-if="showMailIdQuery" class="mail-query">
            <n-input-group>
              <n-input v-model:value="mailIdQuery" />
              <n-button class="query-button" @click="queryMail" type="primary" tertiary>
                {{ t('query') }}
              </n-button>
            </n-input-group>
          </div>
          <MailBox :key="mailBoxKey" :showEMailTo="false" :showReply="openSettings.enableSendMail" :showSaveS3="openSettings.isS3Enabled"
            :saveToS3="saveToS3" :enableUserDeleteEmail="openSettings.enableUserDeleteEmail"
            :fetchMailData="fetchMailData" :deleteMail="deleteMail" :showFilterInput="true" />
        </n-tab-pane>
        <n-tab-pane v-if="openSettings.enableSendMail" name="sendbox" :tab="t('sendbox')">
          <SendBox :fetchMailData="fetchSenboxData" :enableUserDeleteEmail="openSettings.enableUserDeleteEmail"
            :deleteMail="deleteSenboxMail" />
        </n-tab-pane>
        <n-tab-pane v-if="openSettings.enableSendMail" name="sendmail" :tab="t('sendmail')">
          <SendMail />
        </n-tab-pane>
        <n-tab-pane name="accountSettings" :tab="t('accountSettings')">
          <AccountSettings />
        </n-tab-pane>
        <n-tab-pane name="appearance" :tab="t('appearance')">
          <Appearance :showUseSimpleIndex="true" />
        </n-tab-pane>
        <n-tab-pane v-if="openSettings.enableAutoReply" name="auto_reply" :tab="t('auto_reply')">
          <AutoReply />
        </n-tab-pane>
        <n-tab-pane v-if="openSettings.enableWebhook" name="webhook" :tab="t('webhookSettings')">
          <Webhook />
        </n-tab-pane>
        <n-tab-pane v-if="openSettings.isS3Enabled" name="s3_attachment" :tab="t('s3Attachment')">
          <Attachment />
        </n-tab-pane>
        <n-tab-pane v-if="openSettings.enableIndexAbout" name="about" :tab="t('about')">
          <About />
        </n-tab-pane>
      </n-tabs>
    </div>
  </div>
</template>

<style scoped>
.index-shell {
  margin-top: 10px;
  animation: panel-in 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.workspace-tabs {
  border: 1px solid var(--glass-border);
  background:
    linear-gradient(146deg, var(--glass-top) 0%, var(--glass-bottom) 100%);
  border-radius: 20px;
  backdrop-filter: blur(22px) saturate(180%);
  box-shadow: var(--glass-shadow);
  padding: 10px;
  position: relative;
  overflow: hidden;
}

.workspace-tabs::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background:
    radial-gradient(100% 60% at 0% 0%, rgba(255, 255, 255, 0.5), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, transparent 38%);
}

.workspace-tabs :deep(.n-tabs-nav) {
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 72%, transparent);
  background: color-mix(in srgb, var(--glass-top) 56%, transparent);
  backdrop-filter: blur(12px);
}

.workspace-tabs :deep(.n-tabs-tab) {
  min-height: 42px;
  transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.workspace-tabs :deep(.n-tabs-tab:hover) {
  transform: translateY(-1px);
}

.workspace-tabs :deep(.n-tabs-tab__label) {
  color: var(--text-strong);
}

.mode-button {
  min-height: 44px;
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mode-button:hover {
  transform: translateY(-1px);
}

.mail-query {
  margin-bottom: 12px;
}

.query-button {
  min-width: 86px;
  min-height: 44px;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (max-width: 768px) {
  .workspace-tabs {
    border-radius: 16px;
    padding: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .index-shell {
    animation: none;
  }

  .workspace-tabs :deep(.n-tabs-tab),
  .mode-button {
    transition: none;
  }

  .workspace-tabs :deep(.n-tabs-tab:hover),
  .mode-button:hover {
    transform: none;
  }
}
</style>
