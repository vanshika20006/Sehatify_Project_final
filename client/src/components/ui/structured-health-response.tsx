import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Apple, 
  Dumbbell, 
  Play, 
  Lightbulb,
  Clock,
  Coffee,
  Utensils,
  Sandwich,
  Droplets
} from 'lucide-react';

interface StructuredHealthResponse {
  summary?: string;
  dietPlan?: {
    breakfast?: string[];
    lunch?: string[];
    dinner?: string[];
    snacks?: string[];
    hydration?: string[];
    avoid?: string[];
  };
  exercisePlan?: {
    cardio?: string[];
    strength?: string[];
    flexibility?: string[];
    frequency?: string;
  };
  youtubeVideos?: Array<{
    title: string;
    channel: string;
    searchTerm: string;
  }>;
  lifestyleChanges?: string[];
}

interface StructuredHealthResponseProps {
  data: StructuredHealthResponse;
  className?: string;
}

export function StructuredHealthResponse({ data, className = '' }: StructuredHealthResponseProps) {
  const openYouTubeSearch = (searchTerm: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Section */}
      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{data.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Diet Plan Section */}
      {data.dietPlan && Object.keys(data.dietPlan).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-500" />
              Personalized Diet Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.dietPlan.breakfast && data.dietPlan.breakfast.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="w-4 h-4 text-orange-500" />
                  <h4 className="font-semibold">Breakfast</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.dietPlan.breakfast.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.dietPlan.lunch && data.dietPlan.lunch.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-blue-500" />
                  <h4 className="font-semibold">Lunch</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.dietPlan.lunch.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.dietPlan.dinner && data.dietPlan.dinner.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-purple-500" />
                  <h4 className="font-semibold">Dinner</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.dietPlan.dinner.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.dietPlan.snacks && data.dietPlan.snacks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sandwich className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-semibold">Healthy Snacks</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.dietPlan.snacks.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.dietPlan.hydration && data.dietPlan.hydration.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  <h4 className="font-semibold">Hydration</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.dietPlan.hydration.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.dietPlan.avoid && data.dietPlan.avoid.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">⚠️ Foods to Avoid</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                  {data.dietPlan.avoid.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercise Plan Section */}
      {data.exercisePlan && Object.keys(data.exercisePlan).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-500" />
              Exercise Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.exercisePlan.frequency && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-600">Recommended Schedule</span>
                </div>
                <p className="text-sm text-blue-700">{data.exercisePlan.frequency}</p>
              </div>
            )}

            {data.exercisePlan.cardio && data.exercisePlan.cardio.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🏃‍♂️ Cardio Exercises</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.exercisePlan.cardio.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.exercisePlan.strength && data.exercisePlan.strength.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">💪 Strength Training</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.exercisePlan.strength.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.exercisePlan.flexibility && data.exercisePlan.flexibility.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🧘‍♀️ Flexibility & Mobility</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {data.exercisePlan.flexibility.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* YouTube Videos Section */}
      {data.youtubeVideos && data.youtubeVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" />
              Recommended Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {data.youtubeVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{video.title}</h4>
                    <p className="text-xs text-gray-600">by {video.channel}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openYouTubeSearch(video.searchTerm)}
                    className="ml-3"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Watch
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lifestyle Changes Section */}
      {data.lifestyleChanges && data.lifestyleChanges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Lifestyle Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.lifestyleChanges.map((change, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-gray-700">{change}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}