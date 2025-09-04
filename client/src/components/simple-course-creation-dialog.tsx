import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, FileText, PenTool, Sparkles, Check, ChevronRight, Upload } from "lucide-react";
import { useLocation } from "wouter";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
}

interface SimpleCourseCreationDialogProps {
  open: boolean;
  onClose: () => void;
  courseDocuments?: Document[];
}

export default function SimpleCourseCreationDialog({
  open,
  onClose,
  courseDocuments = []
}: SimpleCourseCreationDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [creationType, setCreationType] = useState<'documents' | 'scratch'>('scratch');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("English");

  // Fetch all user documents
  const { data: allDocuments = [] } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    enabled: open
  });

  const availableDocuments = courseDocuments.length > 0 ? courseDocuments : allDocuments;

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleCreateCourse = async () => {
    if (!courseTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a course title",
        variant: "destructive"
      });
      return;
    }

    if (creationType === 'documents' && selectedDocuments.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document for AI generation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the course
      const courseResponse = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: courseTitle,
          description: courseDescription || `A comprehensive ${difficultyLevel} level course`,
          difficultyLevel,
          targetAudience: targetAudience || 'General learners',
          language: language || 'English',
          status: creationType === 'documents' ? 'processing' : 'draft'
        })
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to create course');
      }

      const course = await courseResponse.json();

      // If creating from documents, trigger AI generation
      if (creationType === 'documents' && selectedDocuments.length > 0) {
        // Link documents to the course
        for (const docId of selectedDocuments) {
          await fetch(`/api/courses/${course.id}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ documentId: docId })
          });
        }

        // Start AI generation
        const generationResponse = await fetch('/api/generate-modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            courseId: course.id,
            documentIds: selectedDocuments,
            settings: {
              model: 'gemini',
              generateQuizzes: true,
              quizFrequency: 'lesson',
              questionsPerQuiz: 5,
              moduleCount: 3,
              difficultyLevel
            }
          })
        });

        if (!generationResponse.ok) {
          console.error('AI generation failed but course was created');
        }

        toast({
          title: "Course Created!",
          description: "Your course is being generated from the selected documents. This may take a few moments.",
        });
      } else {
        // For scratch courses, just create the basic structure
        toast({
          title: "Course Created!",
          description: "You can now add modules and lessons to your course.",
        });
      }

      // Navigate to the course editor
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setLocation(`/course-editor/${course.id}`);
      onClose();

    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCourseTitle("");
    setCourseDescription("");
    setDifficultyLevel('beginner');
    setCreationType('scratch');
    setSelectedDocuments([]);
    setTargetAudience("");
    setLanguage("English");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Create New Course
          </DialogTitle>
          <DialogDescription>
            Set up your course details and choose how you want to create content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Course Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Web Development"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn in this course..."
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficultyLevel} onValueChange={(value: any) => setDifficultyLevel(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Beginner
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Intermediate
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Advanced
                      </div>
                    </SelectItem>
                    <SelectItem value="expert">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        Expert
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                    <SelectItem value="Chinese">Chinese</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Beginners with no prior programming experience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Creation Method Selection */}
          <div className="space-y-3">
            <Label>How would you like to create your course?</Label>
            <RadioGroup value={creationType} onValueChange={(value: any) => setCreationType(value)}>
              <Card className={`cursor-pointer transition-all ${creationType === 'scratch' ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="flex items-start gap-3 p-4">
                  <RadioGroupItem value="scratch" id="scratch" className="mt-1" />
                  <label htmlFor="scratch" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <PenTool className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Start from Scratch</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Create your course structure manually. Add modules and lessons one by one with full control.
                    </p>
                  </label>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer transition-all ${creationType === 'documents' ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="flex items-start gap-3 p-4">
                  <RadioGroupItem value="documents" id="documents" className="mt-1" />
                  <label htmlFor="documents" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold">Generate from Documents</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use AI to automatically create modules and lessons from your uploaded documents.
                    </p>
                  </label>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          {/* Document Selection (if documents method selected) */}
          {creationType === 'documents' && (
            <div className="space-y-3">
              <Label>Select Documents for AI Generation</Label>
              {availableDocuments.length > 0 ? (
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {availableDocuments.map((doc) => (
                    <label
                      key={doc.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                      />
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileType.toUpperCase()} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {selectedDocuments.includes(doc.id) && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No documents available
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Upload documents first to use AI generation
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateCourse} disabled={isLoading || !courseTitle.trim()}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                Create Course
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}