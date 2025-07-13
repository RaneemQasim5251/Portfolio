import fs from 'fs';
import path from 'path';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    section: string;
    keywords: string[];
    relevance: number;
  };
}

export class DocumentProcessor {
  private chunks: DocumentChunk[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadDocument();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize document processor:', error);
    }
  }

  private async loadDocument() {
    const docPath = path.join(process.cwd(), 'Raneem_Rag.docx');
    
    try {
      // Check if document exists
      if (fs.existsSync(docPath)) {
        console.log('Raneem_Rag.docx found, but using enhanced fallback knowledge base');
      }
      
      // Use enhanced knowledge base instead of document parsing for now
      this.chunks = this.getEnhancedKnowledgeBase();
      
      console.log(`Loaded ${this.chunks.length} chunks from Raneem's enhanced knowledge base`);
    } catch (error) {
      console.error('Error loading document:', error);
      // Fallback to basic knowledge base
      this.chunks = this.getFallbackKnowledgeBase();
    }
  }

  private processTextIntoChunks(text: string): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    
    // Split by paragraphs and sections
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 20);
    
    paragraphs.forEach((paragraph, index) => {
      const chunk: DocumentChunk = {
        id: `chunk_${index}`,
        content: paragraph.trim(),
        metadata: {
          section: this.detectSection(paragraph),
          keywords: this.extractKeywords(paragraph),
          relevance: 1.0
        }
      };
      
      chunks.push(chunk);
    });
    
    return chunks;
  }

  private detectSection(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('education') || lowerText.includes('تعليم') || lowerText.includes('university')) {
      return 'education';
    }
    if (lowerText.includes('project') || lowerText.includes('مشروع') || lowerText.includes('work')) {
      return 'projects';
    }
    if (lowerText.includes('skill') || lowerText.includes('مهارة') || lowerText.includes('technology')) {
      return 'skills';
    }
    if (lowerText.includes('award') || lowerText.includes('جائزة') || lowerText.includes('achievement')) {
      return 'achievements';
    }
    if (lowerText.includes('experience') || lowerText.includes('خبرة') || lowerText.includes('internship')) {
      return 'experience';
    }
    
    return 'general';
  }

  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    const normalizedText = this.normalizeArabicText(text.toLowerCase());
    
    // Technical keywords (Arabic & English)
    const techKeywords = [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
      'python', 'javascript', 'react', 'node.js', 'tensorflow', 'pytorch', 'opencv',
      'nlp', 'computer vision', 'robotics', 'data science', 'blockchain',
      'ذكاء اصطناعي', 'تعلم آلي', 'تعلم عميق', 'شبكة عصبية', 'معالجة لغة', 'رؤية حاسوبية',
      'بيانات', 'روبوتات', 'برمجة', 'تطوير', 'خوارزمية', 'نموذج', 'تقنية'
    ];
    
    // Project-specific keywords
    const projectKeywords = [
      'nasa', 'sdaia', 'aramco', 'bionic arm', 'pathfinders', 'siraj', 'kaust',
      'liveness detection', 'smart helmet', 'milarity', 'eeg', 'bci', 'robofest',
      'ناسا', 'سراج', 'أرامكو', 'ذراع روبوتية', 'كشف الحيوية', 'خوذة ذكية', 
      'مترو', 'الرياض', 'قوات جوية', 'واجهة دماغ'
    ];
    
    // Educational & Professional keywords
    const educationKeywords = [
      'university', 'bachelor', 'computer engineering', 'internship', 'training',
      'جامعة', 'بكالوريوس', 'هندسة حاسوب', 'تدريب', 'تعليم', 'دراسة', 'شهادة'
    ];
    
    // Achievement keywords
    const achievementKeywords = [
      'first place', 'second place', 'winner', 'award', 'achievement', 'competition',
      'مركز أول', 'مركز ثاني', 'فائز', 'جائزة', 'إنجاز', 'مسابقة', 'بطولة'
    ];
    
    // HUMAIN-related keywords (subtle integration)
    const humainKeywords = [
      'saudi', 'ksa', 'arabic', 'sovereign', 'national', 'innovation', 'vision 2030',
      'السعودية', 'عربي', 'سيادي', 'وطني', 'ابتكار', 'رؤية', 'تطوير محلي'
    ];
    
    // Skills & Technologies
    const skillKeywords = [
      'full stack', 'backend', 'frontend', 'api', 'database', 'cloud', 'docker',
      'تطوير شامل', 'خلفية', 'واجهة', 'قاعدة بيانات', 'سحابة', 'ويب'
    ];
    
    const allKeywords = [
      ...techKeywords, ...projectKeywords, ...educationKeywords, 
      ...achievementKeywords, ...humainKeywords, ...skillKeywords
    ];
    
    allKeywords.forEach(keyword => {
      const normalizedKeyword = this.normalizeArabicText(keyword.toLowerCase());
      if (normalizedText.includes(normalizedKeyword) || 
          normalizedKeyword.includes(normalizedText.split(' ')[0]) ||
          text.toLowerCase().includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    });
    
    // Add exact matches for important terms
    const exactMatches = [
      'سراج', 'siraj', 'ناسا', 'nasa', 'أرامكو', 'aramco', 
      'مترو', 'metro', 'ذراع', 'arm', 'دماغ', 'brain'
    ];
    
    exactMatches.forEach(term => {
      if (normalizedText.includes(this.normalizeArabicText(term)) || 
          text.toLowerCase().includes(term.toLowerCase())) {
        keywords.push(term);
      }
    });
    
    return Array.from(new Set(keywords)); // Remove duplicates
  }

  private getEnhancedKnowledgeBase(): DocumentChunk[] {
    return [
      {
        id: 'intro',
        content: 'رنيم الثقفي: مطورة ذكاء اصطناعي سعودية مبتكرة من الطائف 🇸🇦 تمزج الشعر مع التقنية في فلسفة "اقسم الخلية العصبية وستسمع الإيقاع" 🎵 تؤمن بقوة الذكاء الاصطناعي السيادي والحلول التقنية العربية المتقدمة. بدأت رحلتها بتعلم C في معمل الحاسوب وتسعى لتحقيق رؤية 2030 التقنية.',
        metadata: {
          section: 'general',
          keywords: ['ai', 'saudi', 'arabic', 'sovereign', 'ذكاء اصطناعي', 'سعودية', 'رؤية 2030', 'الطائف', 'شعر', 'فلسفة', 'C', 'programming'],
          relevance: 1.0
        }
      },
      {
        id: 'personal_info',
        content: 'رنيم الثقفي من مواليد الطائف 🏔️ شخصية مبدعة تجمع بين الدقة التقنية والحس الفني الرفيع. بدأت البرمجة مبكراً بلغة C وتحب الشعر العربي الكلاسيكي. تؤمن بأن التقنية والفن مترابطان بشكل عميق وأن أفضل الحلول التقنية تأتي من فهم الثقافة المحلية والاحتياجات الإنسانية.',
        metadata: {
          section: 'personal',
          keywords: ['الطائف', 'مواليد', 'شخصية', 'شعر', 'فن', 'هوية', 'ثقافة', 'عربي', 'C', 'programming', 'early', 'creative'],
          relevance: 1.0
        }
      },
      {
        id: 'nasa_achievement',
        content: '🚀 المركز الأول عالمياً في تحدي ناسا لحطام الفضاء! مشروع Pathfinders يستخدم Machine Learning و Computer Vision لتطوير حلول ذكية لتنظيف الفضاء من الحطام المداري. النظام يتتبع ويصنف الحطام الفضائي لحماية المركبات والأقمار الصناعية من التصادمات المدمرة.',
        metadata: {
          section: 'achievements',
          keywords: ['nasa', 'pathfinders', 'space debris', 'first place', 'global', 'ناسا', 'فضاء', 'machine learning', 'computer vision', 'satellites'],
          relevance: 1.0
        }
      },
      {
        id: 'siraj_assistant',
        content: '🚇 سراج: مساعد المترو الذكي الأول باللغة العربية! يدمج NLP المتقدم مع Computer Vision لمساعدة ركاب مترو الرياض. يمكنه التعرف على المواقع، تقديم إرشادات مفصلة، والإجابة على الاستفسارات باللهجة المحلية. نظام ذكي يفهم السياق الثقافي السعودي ويقدم تجربة مستخدم متميزة.',
        metadata: {
          section: 'projects',
          keywords: ['siraj', 'metro', 'riyadh', 'computer vision', 'nlp', 'arabic', 'مترو', 'مساعد', 'الرياض', 'ذكي', 'لغة عربية'],
          relevance: 1.0
        }
      },
      {
        id: 'bionic_arm',
        content: '🦾 الذراع الروبوتية الذكية - المركز الثاني عالمياً في RoboFest! تدمج الهندسة الطبية الحيوية مع الذكاء الاصطناعي لمساعدة الأشخاص ذوي الإعاقة. تستخدم مستشعرات متقدمة وخوارزميات تعلم آلي للتحكم الدقيق في الحركة وفهم نوايا المستخدم من خلال الإشارات العصبية.',
        metadata: {
          section: 'projects',
          keywords: ['bionic arm', 'robofest', 'robotics', 'biomedical', 'ذراع روبوتية', 'طبية', 'إعاقة', 'مستشعرات', 'تعلم آلي', 'second place'],
          relevance: 1.0
        }
      },
      {
        id: 'aramco_smart_helmet',
        content: '⛑️ الخوذة الذكية في أرامكو: نظام أمان متقدم يراقب صحة العمال بالذكاء الاصطناعي! تجمع البيانات الحيوية (نبضات القلب، درجة الحرارة، مستوى الأكسجين) وتحللها فورياً لكشف التعب والإجهاد. تتضمن لوحات تحكم تفاعلية بـ Power BI لتنبيه المشرفين في الوقت الفعلي.',
        metadata: {
          section: 'projects',
          keywords: ['aramco', 'smart helmet', 'power bi', 'iot', 'safety', 'أرامكو', 'خوذة ذكية', 'أمان', 'عمال', 'صحة', 'بيانات حيوية'],
          relevance: 1.0
        }
      },
      {
        id: 'liveness_detection',
        content: '👁️ نظام كشف الحيوية المتطور: يستخدم تقنية PEQ-rPPG لتحليل نبضات القلب من الفيديو! يطبق EfficientNet للاستخراج الملامح مع VGG19-LSTM للتحليل الزمني. يكشف محاولات التزييف بدقة عالية من خلال تحليل التغيرات الدقيقة في تدفق الدم تحت الجلد - تقنية أمان بيومترية متقدمة.',
        metadata: {
          section: 'projects',
          keywords: ['liveness detection', 'rppg', 'efficientnet', 'vgg19', 'lstm', 'biometric', 'كشف الحيوية', 'أمان', 'بيومتري', 'تزييف'],
          relevance: 1.0
        }
      },
      {
        id: 'bci_brain_interface',
        content: '🧠 واجهة الدماغ-الحاسوب: لوحة مفاتيح ذكية بإشارات EEG SSVEP! تساعد الأشخاص ذوي الإعاقات الحركية الشديدة على الطباعة بسرعة 30 كلمة/دقيقة باستخدام التركيز الذهني فقط. تستخدم نماذج AI متقدمة للتنبؤ بالنصوص العربية وتحليل الإشارات العصبية بدقة عالية.',
        metadata: {
          section: 'research',
          keywords: ['bci', 'eeg', 'ssvep', 'brain computer interface', 'arabic', 'واجهة دماغ', 'إعاقة', 'كتابة', 'تركيز', 'إشارات عصبية'],
          relevance: 1.0
        }
      },
      {
        id: 'milarity_air_force',
        content: '✈️ مشروع MILARITY للقوات الجوية السعودية: نظام سيادي متكامل يجمع Cloud Engineering مع AI Analytics! يوفر لوحة تحكم آمنة للمهام الجوية مع خوارزميات تعلم آلي لدعم القرارات التكتيكية. حل تقني عسكري متقدم يعزز الأمن القومي السعودي.',
        metadata: {
          section: 'projects',
          keywords: ['milarity', 'air force', 'cloud', 'military', 'sovereign', 'قوات جوية', 'سحابة', 'عسكري', 'سيادي', 'أمن قومي'],
          relevance: 1.0
        }
      },
      {
        id: 'poetry_art_connection',
        content: '🎨 مشروع ربط الشعر بالفن: يدمج NLP مع Computer Vision لإيجاد الروابط بين الشعر العربي واللوحات الفنية! يحلل المعنى الدلالي للأبيات الشعرية الكلاسيكية ويربطها بقاعدة بيانات WikiArt. يكشف الروابط العميقة بين المشاعر الشعرية والتعبيرات الفنية البصرية.',
        metadata: {
          section: 'projects',
          keywords: ['poetry', 'art', 'nlp', 'computer vision', 'arabic poetry', 'شعر', 'فن', 'معنى', 'مشاعر', 'wikiart'],
          relevance: 1.0
        }
      },
      {
        id: 'technical_mastery',
        content: '💻 خبرة تقنية متقدمة: Python, JavaScript, C++ | React, Node.js, TensorFlow, PyTorch | Computer Vision, NLP, Deep Learning | Git, Docker, Cloud Services, Power BI | قواعد البيانات وأنظمة التطوير المتكاملة. تتقن الأدوات الحديثة وتطبق أفضل الممارسات في هندسة البرمجيات.',
        metadata: {
          section: 'skills',
          keywords: ['python', 'javascript', 'react', 'tensorflow', 'pytorch', 'git', 'docker', 'power bi', 'برمجة', 'تقنيات', 'خبرة'],
          relevance: 1.0
        }
      },
      {
        id: 'ai_philosophy',
        content: '🌙 فلسفة رنيم: "اقسم الخلية العصبية وستسمع الإيقاع" - التقنية والفن مترابطان بشكل عميق! تؤمن بـ"التقنية بقلب عربي" لتطوير حلول متقدمة تحافظ على الهوية الثقافية. أفضل الابتكارات تأتي من فهم الاحتياجات المحلية والثقافة العربية الأصيلة.',
        metadata: {
          section: 'philosophy',
          keywords: ['philosophy', 'creativity', 'culture', 'neuron rhythm', 'فلسفة', 'إبداع', 'ثقافة', 'عربي', 'هوية', 'ابتكار'],
          relevance: 1.0
        }
      },
      {
        id: 'sovereign_ai_vision',
        content: '🇸🇦 رؤية الذكاء الاصطناعي السيادي: تطوير نماذج لغوية عربية متقدمة ومساعدات صوتية باللهجات المحلية! تعمل على بناء مستقبل تقني يحافظ على الهوية الثقافية مع الاستفادة من التطورات العالمية. هدفها خلق نظام AI عربي مستقل وقوي.',
        metadata: {
          section: 'vision',
          keywords: ['sovereign ai', 'arabic models', 'cultural identity', 'local needs', 'ذكاء سيادي', 'نماذج عربية', 'لهجات', 'هوية'],
          relevance: 1.0
        }
      },
      {
        id: 'achievements_awards',
        content: '🏆 إنجازات متميزة: المركز الأول عالمياً (ناسا) | المركز الثاني عالمياً (RoboFest) | جوائز متعددة من SDAIA وأرامكو | منح بحثية من KAUST | شهادات تقدير في مسابقات الذكاء الاصطناعي المحلية والإقليمية. سجل حافل بالإنجازات التقنية المتميزة.',
        metadata: {
          section: 'achievements',
          keywords: ['جوائز', 'إنجازات', 'ناسا', 'robofest', 'sdaia', 'أرامكو', 'kaust', 'منح', 'تقدير', 'مسابقات'],
          relevance: 1.0
        }
      },
      {
        id: 'research_focus',
        content: '🔬 اهتمامات بحثية متقدمة: الذكاء الاصطناعي السيادي والنماذج العربية | واجهات الدماغ-الحاسوب | الأمان السيبراني والكشف الحيوي | الروبوتات الطبية والمساعدة | معالجة اللغات الطبيعية العربية | الرؤية الحاسوبية في الفن والثقافة | IoT والمدن الذكية.',
        metadata: {
          section: 'research',
          keywords: ['بحث', 'اهتمامات', 'نماذج لغوية', 'واجهة دماغ', 'أمان', 'روبوتات', 'رؤية حاسوبية', 'سحابة', 'مدن ذكية'],
          relevance: 1.0
        }
      },
      {
        id: 'community_leadership',
        content: '👥 قيادة المجتمع التقني: متحدثة في مؤتمرات AI المحلية والإقليمية | ورش عمل للطلاب والمطورين | مبادرات التطوير المهني للنساء في التقنية | تطوع في تعليم البرمجة للأطفال | كتابة مقالات تقنية عربية | تحكيم المسابقات واستشارات الشركات الناشئة.',
        metadata: {
          section: 'community',
          keywords: ['مجتمع', 'مؤتمرات', 'ورش عمل', 'تطوع', 'تعليم', 'نساء', 'تقنية', 'استشارات', 'قيادة', 'مقالات'],
          relevance: 1.0
        }
      },
      {
        id: 'strategic_partnerships',
        content: '🤝 شراكات استراتيجية: KAUST (بحث متقدم) | SDAIA (ذكاء اصطناعي سيادي) | أرامكو (حلول صناعية) | مبادرات رؤية 2030 | شركات التقنية الناشئة | مؤسسات بحثية دولية في AI. شبكة تعاون واسعة لتطوير النظام التقني السعودي.',
        metadata: {
          section: 'partnerships',
          keywords: ['تعاون', 'شراكات', 'kaust', 'sdaia', 'أرامكو', 'رؤية 2030', 'شركات ناشئة', 'دولية', 'بحث'],
          relevance: 1.0
        }
      },
      {
        id: 'current_innovations',
        content: '⚡ المشاريع الحالية: نماذج لغوية عربية متقدمة | تطبيقات BCI لذوي الإعاقة | أنظمة أمان ذكية للحكومة | منصة تعليمية تفاعلية للـ AI باللغة العربية | حلول IoT للمدن الذكية | تطبيقات AI في الطب والرعاية الصحية. مشاريع مستقبلية تخدم المجتمع السعودي.',
        metadata: {
          section: 'current',
          keywords: ['مشاريع حالية', 'نماذج عربية', 'أمان', 'تعليم', 'مدن ذكية', 'طب', 'رعاية صحية', 'حكومة', 'iot'],
          relevance: 1.0
        }
      },
      {
        id: 'future_vision',
        content: '🚀 رؤية المستقبل: قيادة تطوير الذكاء الاصطناعي في المنطقة العربية | بناء فرق تقنية متخصصة | إنشاء مراكز بحثية متقدمة | حل التحديات المحلية بأحدث تقنيات AI | تحقيق رؤية 2030 التقنية | بناء جسور بين الأكاديميين والممارسين لخدمة المجتمع.',
        metadata: {
          section: 'future',
          keywords: ['leadership', 'vision 2030', 'research centers', 'innovation', 'قيادة', 'مراكز بحثية', 'مستقبل', 'فرق', 'تحديات'],
          relevance: 1.0
        }
      }
    ];
  }

  private getFallbackKnowledgeBase(): DocumentChunk[] {
    return [
      {
        id: 'intro',
        content: 'رنيم الثقفي مطورة ذكاء اصطناعي ومبتكرة سعودية تمزج بين التقنية والإبداع. تؤمن بقوة الذكاء الاصطناعي السيادي وتطوير حلول تقنية باللغة العربية.',
        metadata: {
          section: 'general',
          keywords: ['ai', 'saudi', 'arabic', 'sovereign', 'ذكاء اصطناعي', 'سعودية'],
          relevance: 1.0
        }
      },
      {
        id: 'education',
        content: 'حاصلة على شهادة البكالوريوس في هندسة الحاسوب، مع خبرة واسعة في تطوير أنظمة الذكاء الاصطناعي والتعلم الآلي. شاركت في برامج تدريبية متقدمة مع هيئة البيانات والذكاء الاصطناعي السعودية.',
        metadata: {
          section: 'education',
          keywords: ['computer engineering', 'sdaia', 'تعليم', 'هندسة'],
          relevance: 1.0
        }
      },
      {
        id: 'projects',
        content: 'طورت مشاريع متنوعة منها: مساعد المترو الذكي "سراج" الذي يعمل بالذكاء الاصطناعي، نظام كشف الحيوية للوجه، والذراع الروبوتية التي فازت بالمركز الثاني عالمياً في مسابقة RoboFest.',
        metadata: {
          section: 'projects',
          keywords: ['siraj', 'liveness detection', 'bionic arm', 'robofest', 'مشاريع'],
          relevance: 1.0
        }
      },
      {
        id: 'achievements',
        content: 'حازت على المركز الأول عالمياً في تحدي ناسا لحطام الفضاء بمشروع "Pathfinders". كما شاركت في مسابقات وطنية ودولية متعددة في مجال الذكاء الاصطناعي والروبوتات.',
        metadata: {
          section: 'achievements',
          keywords: ['nasa', 'pathfinders', 'first place', 'awards', 'جوائز'],
          relevance: 1.0
        }
      },
      {
        id: 'vision',
        content: 'تؤمن رنيم بأن مستقبل الذكاء الاصطناعي في المنطقة يبدأ بتطوير نماذج سيادية تفهم اللغة العربية وتخدم احتياجات المجتمع المحلي. تهدف لبناء جسور بين التقنية والثقافة العربية.',
        metadata: {
          section: 'vision',
          keywords: ['sovereign ai', 'arabic', 'future', 'رؤية', 'مستقبل'],
          relevance: 1.0
        }
      }
    ];
  }

  public searchRelevantChunks(query: string, limit: number = 3): DocumentChunk[] {
    if (!this.isInitialized) {
      return [];
    }

    const normalizedQuery = this.normalizeArabicText(query.toLowerCase());
    const queryKeywords = this.extractKeywords(query);
    const queryTerms = this.extractQueryTerms(query);
    
    console.log(`RAG Search: "${query}" -> keywords: [${queryKeywords.join(', ')}] -> terms: [${queryTerms.join(', ')}]`);
    
    // Score each chunk based on multiple relevance factors
    const scoredChunks = this.chunks.map(chunk => {
      let score = 0;
      const normalizedContent = this.normalizeArabicText(chunk.content.toLowerCase());
      
      // 1. Direct text match (highest priority)
      if (normalizedContent.includes(normalizedQuery)) {
        score += 20;
      }
      
      // 2. Individual term matching
      queryTerms.forEach(term => {
        if (normalizedContent.includes(this.normalizeArabicText(term))) {
          score += 8;
        }
      });
      
      // 3. Keyword matching (medium priority)
      queryKeywords.forEach(keyword => {
        const normalizedKeyword = this.normalizeArabicText(keyword);
        
        // Exact keyword match in metadata
        if (chunk.metadata.keywords.some(k => this.normalizeArabicText(k).includes(normalizedKeyword))) {
          score += 12;
        }
        
        // Keyword appears in content
        if (normalizedContent.includes(normalizedKeyword)) {
          score += 6;
        }
        
        // Partial keyword match
        chunk.metadata.keywords.forEach(chunkKeyword => {
          if (this.normalizeArabicText(chunkKeyword).includes(normalizedKeyword) || 
              normalizedKeyword.includes(this.normalizeArabicText(chunkKeyword))) {
            score += 3;
          }
        });
      });
      
      // 4. Semantic matching for specific topics
      score += this.getSemanticScore(query, chunk);
      
      // 5. Section relevance
      const detectedSection = this.detectSection(query);
      if (detectedSection === chunk.metadata.section) {
        score += 5;
      }
      
      // 6. Length bonus for more informative chunks
      if (chunk.content.length > 200) {
        score += 2;
      }
      
      return { ...chunk, score };
    });
    
    // Sort by score and return top chunks
    const results = scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(chunk => chunk.score > 0);
    
    console.log(`RAG Results: Found ${results.length} relevant chunks with scores:`, 
      results.map(r => `${r.id}(${r.score})`));
    
    return results;
  }

  private normalizeArabicText(text: string): string {
    return text
      // Remove diacritics
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      // Normalize Arabic letters
      .replace(/[إأآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ي/g, 'ى')
      // Remove extra spaces and punctuation
      .replace(/[^\u0600-\u06FF\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractQueryTerms(query: string): string[] {
    // Extract meaningful terms from query
    const terms = query
      .toLowerCase()
      .split(/[\s,،؟?]+/)
      .filter(term => term.length > 2)
      .filter(term => !['what', 'how', 'why', 'when', 'where', 'who', 'ما', 'كيف', 'لماذا', 'متى', 'أين', 'من', 'عن', 'في', 'على', 'هو', 'هي', 'the', 'a', 'an', 'is', 'are', 'was', 'were'].includes(term));
    
    return terms;
  }

  private getSemanticScore(query: string, chunk: DocumentChunk): number {
    const lowerQuery = query.toLowerCase();
    let semanticScore = 0;
    
    // Project-specific matching
    const projectQueries = {
      'siraj': ['سراج', 'مترو', 'metro', 'assistant', 'مساعد', 'riyadh', 'الرياض'],
      'nasa': ['ناسا', 'nasa', 'space', 'فضاء', 'pathfinders', 'debris', 'حطام'],
      'bionic': ['ذراع', 'arm', 'bionic', 'robofest', 'روبوت', 'طبية'],
      'liveness': ['حيوية', 'liveness', 'detection', 'كشف', 'وجه', 'face', 'rppg'],
      'aramco': ['أرامكو', 'aramco', 'helmet', 'خوذة', 'smart', 'ذكية'],
      'milarity': ['milarity', 'قوات', 'air force', 'جوية', 'عسكري'],
      'bci': ['دماغ', 'brain', 'bci', 'eeg', 'مفاتيح', 'keyboard'],
      'education': ['تعليم', 'education', 'university', 'جامعة', 'kaust', 'sdaia'],
      'poetry': ['شعر', 'poetry', 'art', 'فن']
    };
    
    Object.entries(projectQueries).forEach(([project, keywords]) => {
      const queryMatch = keywords.some(keyword => 
        lowerQuery.includes(keyword.toLowerCase()) || 
        this.normalizeArabicText(lowerQuery).includes(this.normalizeArabicText(keyword))
      );
      
      if (queryMatch && chunk.id.includes(project.substring(0, 4))) {
        semanticScore += 15;
      }
    });
    
    // Topic-based matching
    if ((lowerQuery.includes('مشروع') || lowerQuery.includes('project')) && chunk.metadata.section === 'projects') {
      semanticScore += 10;
    }
    
    if ((lowerQuery.includes('تعليم') || lowerQuery.includes('education') || lowerQuery.includes('دراسة')) && chunk.metadata.section === 'education') {
      semanticScore += 10;
    }
    
    if ((lowerQuery.includes('إنجاز') || lowerQuery.includes('achievement') || lowerQuery.includes('جائزة') || lowerQuery.includes('award')) && chunk.metadata.section === 'achievements') {
      semanticScore += 10;
    }
    
    return semanticScore;
  }

  public addHUMAINContext(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Subtle HUMAIN context integration
    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence') || lowerQuery.includes('ذكاء اصطناعي')) {
      return 'في إطار الجهود الوطنية لتطوير الذكاء الاصطناعي وتحقيق الريادة التقنية، ';
    }
    
    if (lowerQuery.includes('saudi') || lowerQuery.includes('السعودية')) {
      return 'كجزء من رؤية المملكة 2030 والتحول الرقمي، ';
    }
    
    if (lowerQuery.includes('arabic') || lowerQuery.includes('عربي')) {
      return 'في إطار تطوير التقنيات الناطقة بالعربية ودعم المحتوى العربي، ';
    }
    
    return '';
  }
}

export const documentProcessor = new DocumentProcessor(); 