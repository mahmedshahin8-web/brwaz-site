/**
 * @file styleGuide.ts
 * @description دليل الأسلوب (Style Guide) للعامية المصرية الراقية
 */

export interface TextValidationRules {
  positiveRules: string[];
  negativeRules: string[];
}

export interface StyleRules {
  formatting: string[];
  vocabulary: {
    forbidden: string[];
    allowed: string[];
  };
}

export const egStyleGuide: StyleRules = {
  formatting: [
    'استخدام التشكيل الخفيف',
    'الحفاظ على إيقاع الجمل السريع',
    'تجنب الجمل الطويلة والمعقدة',
  ],
  vocabulary: {
    forbidden: [
      'في الخاتمة',
      'نستنتج أن',
      'لقد لاحظنا',
      'نتيجة لذلك',
    ],
    allowed: [
      'تخيل',
      'خليني أقولك',
      'علشان كده',
      'بص يا سيدي',
    ],
  },
};
