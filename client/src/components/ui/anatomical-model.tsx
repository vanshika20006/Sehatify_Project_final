import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Heart, Brain, Hand, Ear, Activity, MoreHorizontal, Wind } from 'lucide-react';

interface AnatomicalModel {
  id: string;
  title: string;
  description: string;
  sketchfabUrl: string;
  bodyPart: string;
  icon: any;
  conditions: string[];
}

interface AnatomicalModelProps {
  modelId?: string;
  bodyPart?: string;
  condition?: string;
  className?: string;
}

const anatomicalModels: AnatomicalModel[] = [
  {
    id: 'heart',
    title: 'Realistic Human Heart',
    description: 'Interactive 3D model of the human heart showing chambers, valves, and major vessels',
    sketchfabUrl: 'https://sketchfab.com/models/3f8072336ce94d18b3d0d055a1ece089/embed',
    bodyPart: 'heart',
    icon: Heart,
    conditions: ['heart disease', 'cardiac', 'cardiovascular', 'chest pain', 'heart attack', 'arrhythmia', 'blood pressure', 'hypertension']
  },
  {
    id: 'hand',
    title: 'Female Hand Anatomy',
    description: 'Detailed 3D model of hand structure showing bones, joints, and muscle attachments',
    sketchfabUrl: 'https://sketchfab.com/models/3e9b8ad1942048e3a267d92fb1124d46/embed',
    bodyPart: 'hand',
    icon: Hand,
    conditions: ['hand pain', 'wrist pain', 'arthritis', 'carpal tunnel', 'finger injury', 'tendon', 'joint pain']
  },
  {
    id: 'ear',
    title: 'Ear Cross-Section',
    description: 'Cross-sectional view of the ear showing inner, middle, and outer ear structures',
    sketchfabUrl: 'https://sketchfab.com/models/4f5438fc9337454587ec4a2c30c8c42f/embed',
    bodyPart: 'ear',
    icon: Ear,
    conditions: ['ear pain', 'hearing loss', 'tinnitus', 'ear infection', 'vertigo', 'balance problems', 'earache']
  },
  {
    id: 'brain',
    title: 'Human Brain',
    description: 'Interactive brain model displaying different regions and neural structures',
    sketchfabUrl: 'https://sketchfab.com/models/7a27c17fd6c0488bb31ab093236a47fb/embed',
    bodyPart: 'brain',
    icon: Brain,
    conditions: ['headache', 'migraine', 'memory problems', 'cognitive', 'neurological', 'stroke', 'brain fog', 'mental health']
  },
  {
    id: 'pelvis',
    title: 'Pelvic Skeleton',
    description: 'Detailed pelvic bone structure showing hip joints and surrounding anatomy',
    sketchfabUrl: 'https://sketchfab.com/models/a5728457b02b411596ddbae90383fa1a/embed',
    bodyPart: 'pelvis',
    icon: MoreHorizontal,
    conditions: ['hip pain', 'pelvic pain', 'lower back pain', 'reproductive health', 'pregnancy', 'pelvic floor']
  },
  {
    id: 'organs',
    title: 'Human Internal Organs',
    description: 'Complete overview of major internal organs and their positioning',
    sketchfabUrl: 'https://sketchfab.com/models/fe69d7b1ed6f46a3bd0b6933b796092e/embed',
    bodyPart: 'internal organs',
    icon: Activity,
    conditions: ['abdominal pain', 'digestive issues', 'organ function', 'internal medicine', 'anatomy overview']
  },
  {
    id: 'eyes',
    title: 'Human Eye with Layers',
    description: 'Layered eye model showing retina, lens, cornea, and other ocular structures',
    sketchfabUrl: 'https://sketchfab.com/models/160c3a0121784ca8a376eac6b55cc56f/embed',
    bodyPart: 'eyes',
    icon: Eye,
    conditions: ['eye pain', 'vision problems', 'dry eyes', 'eye strain', 'vision loss', 'eye infection', 'blurred vision']
  },
  {
    id: 'digestive',
    title: 'Digestive System',
    description: 'Complete digestive tract from mouth to intestines showing all major components',
    sketchfabUrl: 'https://sketchfab.com/models/0031f9c064d44c42a251543dc500f525/embed',
    bodyPart: 'digestive system',
    icon: MoreHorizontal,
    conditions: ['stomach pain', 'digestive issues', 'nausea', 'constipation', 'diarrhea', 'acid reflux', 'IBS', 'gut health']
  },
  {
    id: 'lungs',
    title: 'Lungs - Anatomy',
    description: 'Detailed lung anatomy showing bronchi, alveoli, and respiratory structures',
    sketchfabUrl: 'https://sketchfab.com/models/8c3d8dbc9bd24f2b9326acccc58c7987/embed',
    bodyPart: 'lungs',
    icon: Wind,
    conditions: ['breathing problems', 'cough', 'shortness of breath', 'asthma', 'respiratory', 'lung infection', 'chest tightness']
  },
  {
    id: 'kidney',
    title: 'Kidney Cross Section',
    description: 'Cross-sectional kidney anatomy showing internal structure and blood vessels',
    sketchfabUrl: 'https://sketchfab.com/models/fde537a7868b4f8db87450720dc7611f/embed',
    bodyPart: 'kidney',
    icon: MoreHorizontal,
    conditions: ['kidney pain', 'urinary problems', 'kidney stones', 'UTI', 'back pain', 'kidney function', 'nephrology']
  }
];

export function AnatomicalModel({ modelId, bodyPart, condition, className = '' }: AnatomicalModelProps) {
  const [selectedModel, setSelectedModel] = useState<AnatomicalModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the appropriate model based on props
    let model: AnatomicalModel | null = null;

    if (modelId) {
      model = anatomicalModels.find(m => m.id === modelId) || null;
    } else if (bodyPart) {
      model = anatomicalModels.find(m => 
        m.bodyPart.toLowerCase().includes(bodyPart.toLowerCase())
      ) || null;
    } else if (condition) {
      model = anatomicalModels.find(m => 
        m.conditions.some(c => 
          condition.toLowerCase().includes(c.toLowerCase()) ||
          c.toLowerCase().includes(condition.toLowerCase())
        )
      ) || null;
    }

    setSelectedModel(model);
    setLoading(false);
  }, [modelId, bodyPart, condition]);

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedModel) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No anatomical model available for this topic</p>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = selectedModel.icon;

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-blue-600" />
          {selectedModel.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {selectedModel.description}
        </p>
        <Badge variant="outline" className="w-fit">
          {selectedModel.bodyPart}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 overflow-hidden">
          <div className="sketchfab-embed-wrapper h-full">
            <iframe
              title={selectedModel.title}
              frameBorder="0"
              allowFullScreen
              allow="autoplay; fullscreen; xr-spatial-tracking"
              src={`${selectedModel.sketchfabUrl}?ui_theme=dark&dnt=1`}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Interactive 3D model - Click and drag to rotate, scroll to zoom
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility function to find the best matching model for a given text
export function findBestAnatomicalModel(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  for (const model of anatomicalModels) {
    // Check if body part is mentioned
    if (lowerText.includes(model.bodyPart.toLowerCase())) {
      return model.id;
    }
    
    // Check if any condition is mentioned
    if (model.conditions.some(condition => 
      lowerText.includes(condition.toLowerCase()) || 
      condition.toLowerCase().includes(lowerText.split(' ').find(word => word.length > 3) || '')
    )) {
      return model.id;
    }
  }
  
  return null;
}

// Export the models data for use in other components
export { anatomicalModels };