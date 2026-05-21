import { toast } from 'react-hot-toast';
import React from 'react';
import { CyberToast } from '../components/CyberToast';
import { UI_MESSAGES, CLEARANCE_LEVELS } from '../constants/messages';

type ClearanceType = keyof typeof CLEARANCE_LEVELS;

export const notify = {
  classified: (msgKey: keyof typeof UI_MESSAGES | string) => {
    const message = (UI_MESSAGES as any)[msgKey] || msgKey;
    toast.custom((t) => (
      <CyberToast 
        message={message} 
        level="CLASSIFIED" 
      />
    ), { duration: 3000 });
  },
  
  topSecret: (msgKey: keyof typeof UI_MESSAGES | string) => {
    const message = (UI_MESSAGES as any)[msgKey] || msgKey;
    toast.custom((t) => (
      <CyberToast 
        message={message} 
        level="TOP_SECRET" 
      />
    ), { duration: 4000 });
  },
  
  breach: (msgKey: keyof typeof UI_MESSAGES | string) => {
    const message = (UI_MESSAGES as any)[msgKey] || msgKey;
    toast.custom((t) => (
      <CyberToast 
        message={message} 
        level="BREACH" 
      />
    ), { duration: 5000 });
  },
  
  systemVoice: (msgKey: keyof typeof UI_MESSAGES | string) => {
    const message = (UI_MESSAGES as any)[msgKey] || msgKey;
    toast.custom((t) => (
      <CyberToast 
        message={message} 
        level="SYSTEM_VOICE" 
      />
    ), { duration: 3000 });
  }
};
