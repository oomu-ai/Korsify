import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface SimpleCourseCreationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SimpleCourseCreationDialog({
  open,
  onClose
}: SimpleCourseCreationDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('beginner');
  const [targetAudience, setTargetAudience] = useState("");
  const [language, setLanguage] = useState("English");


  const handleCreateCourse = async () => {
    if (!courseTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a course title",
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
          status: 'draft'
        })
      });

      if (!courseResponse.ok) {
        throw new Error('Failed to create course');
      }

      const course = await courseResponse.json();

      toast({
        title: "Course Created!",
        description: "You can now add modules and lessons to your course.",
      });

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
            Enter your course details to get started
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