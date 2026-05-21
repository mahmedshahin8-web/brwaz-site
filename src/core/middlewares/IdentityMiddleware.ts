import { getPersona, PersonaId } from '../identity/personas';
import { IdentityValidation, PositiveConstraints, NegativeConstraints } from '../identity/identityGuard';
import { PlatformDNA } from '../config/dna';

export class IdentityMiddleware {
  static injectPersona(prompt: string, personaId: PersonaId): string {
    const persona = getPersona(personaId);
    
    const guidelines = `
أنت الآن تجسد شخصية "${persona.name}".
دورك: ${persona.role}
أسلوبك اللغوي: ${persona.language_style === 'ammiya_raqiya' ? 'عامية مصرية راقية (بأسلوب الدحيح، الاقتصاد الكوكب)' : persona.language_style}
النبرة العامة: ${persona.tone}

تعليمات وإرشادات حيوية:
يجب أن تتضمن الجمل هذه الأنماط أو المشابهة لها: ${persona.guardrails.required_patterns.join("، ")}
ممنوع منعا باتا استخدام هذه الأنماط (تجنبها تماما ولا تذكرها): ${persona.guardrails.forbidden_patterns.join("، ")}
مستوى الفصحى الأقصى المسموح: ${persona.guardrails.max_formality_level}

أمثلة على أسلوب الإجابة المقبول:
${persona.examples.map(ex => `\nسؤال/مدخل: ${ex.input}\nإجابة صحيحة: ${ex.expected_output}`).join("\n")}

يجب عليك اتباع القواعد السلبية والإيجابية التالية (لغة الروبوتات ممنوعة):
- لا تستخدم جملاً مثل: "في الختام", "نستنتج أن", "أود التأكيد".
- استخدم العواطف والأمثلة الحياتية.
`;

    return `${guidelines}\n\nالمهمة الحالية للقيام بها بناء على شخصيتك:\n${prompt}`;
  }

  static applyStyleGuard(text: string): string {
    const validation = IdentityValidation.validateText(text);
    if (!validation.isValid) {
      console.warn('IdentityGuard issues detected in generated text:', validation.issues);
    }

    return IdentityValidation.sanitizeText(text);
  }
}
