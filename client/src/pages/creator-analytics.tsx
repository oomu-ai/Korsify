import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Clock,
  Award,
  BarChart3,
  Activity,
  Star,
  Calendar,
  Download,
  Filter,
  ChevronRight,
  Eye,
  GraduationCap,
  UserCheck,
  FileText,
  PlayCircle,
  CheckCircle
} from "lucide-react";
import Navigation from "@/components/navigation";
import type { User } from "@shared/schema";

// Helper function to calculate growth
const calculateGrowth = (current: number, previous: number): string => {
  if (previous === 0) return '0';
  return ((current - previous) / previous * 100).toFixed(1);
};

export default function CreatorAnalytics() {
  const [, setLocation] = useLocation();
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedCourse, setSelectedCourse] = useState("all");

  // Check user authentication and role
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch analytics data
  const { data: baseAnalytics, isLoading: baseLoading } = useQuery({
    queryKey: ["/api/analytics/creator"],
    enabled: !!user && user.currentRole === 'creator'
  });

  const { data: courseAnalytics, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/analytics/creator/courses"],
    enabled: !!user && user.currentRole === 'creator'
  });

  const { data: studentDemographics, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/analytics/creator/students"],
    enabled: !!user && user.currentRole === 'creator'
  });

  const { data: engagementMetrics, isLoading: engagementLoading } = useQuery({
    queryKey: ["/api/analytics/creator/engagement"],
    enabled: !!user && user.currentRole === 'creator'
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["/api/analytics/creator/revenue", 12],
    enabled: !!user && user.currentRole === 'creator'
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/analytics/creator/activities", 10],
    enabled: !!user && user.currentRole === 'creator'
  });

  const isLoading = userLoading || baseLoading || coursesLoading || 
                    studentsLoading || engagementLoading || revenueLoading || activitiesLoading;

  useEffect(() => {
    if (!userLoading && (!user || user.currentRole !== 'creator')) {
      setLocation('/login');
    }
  }, [user, userLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.currentRole !== 'creator') {
    return null;
  }

  // Calculate summary statistics from real data
  const totalRevenue = revenueData ? revenueData.reduce((sum: number, item: any) => sum + item.revenue, 0) : 0;
  const totalStudents = baseAnalytics?.totalLearners || 0;
  const avgRating = baseAnalytics?.averageRating?.toFixed(1) || '0.0';
  const avgCompletionRate = Math.round(baseAnalytics?.completionRate || 0);

  // Calculate growth rates from revenue data
  const revenueGrowth = revenueData && revenueData.length >= 2 ?
    calculateGrowth(revenueData[revenueData.length - 1].revenue, revenueData[revenueData.length - 2].revenue) : '0';
  
  const studentGrowth = revenueData && revenueData.length >= 2 ?
    calculateGrowth(revenueData[revenueData.length - 1].students, revenueData[revenueData.length - 2].students) : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">Track your course performance and student engagement</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center mt-2">
                {parseFloat(revenueGrowth) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${parseFloat(revenueGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
              <div className="flex items-center mt-2">
                {parseFloat(studentGrowth) > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${parseFloat(studentGrowth) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {studentGrowth}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating}</div>
              <div className="flex items-center mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(parseFloat(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 ml-2">from {totalStudents} reviews</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgCompletionRate}%</div>
              <Progress value={avgCompletionRate} className="mt-2" />
              <span className="text-xs text-gray-600 mt-1">Average across all courses</span>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over the past year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366F1" fill="#818CF8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Student Enrollment Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Growth</CardTitle>
                  <CardDescription>New students enrolled per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Student Activities</CardTitle>
                <CardDescription>Latest interactions from your students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(recentActivities || []).map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={activity.avatar || undefined} />
                          <AvatarFallback>{activity.student.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.student}
                            {activity.action === 'completed' && (
                              <span className="text-green-600 ml-2">completed</span>
                            )}
                            {activity.action === 'enrolled' && (
                              <span className="text-blue-600 ml-2">enrolled in</span>
                            )}
                            {activity.action === 'scored' && (
                              <span className="text-purple-600 ml-2">scored {activity.score}% on</span>
                            )}
                            <span className="text-gray-700 ml-1 font-normal">{activity.course}</span>
                          </p>
                          {activity.module && (
                            <p className="text-xs text-gray-500 mt-1">{activity.module}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            {/* Course Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Detailed metrics for each course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Course</th>
                        <th className="text-center py-3 px-4">Students</th>
                        <th className="text-center py-3 px-4">Rating</th>
                        <th className="text-center py-3 px-4">Revenue</th>
                        <th className="text-center py-3 px-4">Completion</th>
                        <th className="text-center py-3 px-4">Avg Progress</th>
                        <th className="text-center py-3 px-4">Quiz Score</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(courseAnalytics || []).map((course: any) => (
                        <tr key={course.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-sm">{course.title}</p>
                              <p className="text-xs text-gray-500">
                                {course.totalLessons} lessons, {course.totalQuizzes} quizzes
                              </p>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="secondary">{course.students.toLocaleString()}</Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-sm">{course.rating.toFixed(1)}</span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 font-medium">
                            ${course.revenue.toLocaleString()}
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium">{Math.round(course.completionRate)}%</span>
                              <Progress value={course.completionRate} className="w-20 h-2 mt-1" />
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium">{Math.round(course.avgProgress)}%</span>
                              <Progress value={course.avgProgress} className="w-20 h-2 mt-1" />
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant={course.avgQuizScore >= 80 ? "default" : "secondary"}>
                              {Math.round(course.avgQuizScore)}%
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Learning Path Completion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Path Progress</CardTitle>
                  <CardDescription>Student progress across difficulty levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentDemographics?.learningPaths || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="path" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" />
                      <Bar dataKey="inProgress" fill="#F59E0B" name="In Progress" />
                      <Bar dataKey="notStarted" fill="#EF4444" name="Not Started" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Categories</CardTitle>
                  <CardDescription>Distribution of courses by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Technology</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">42%</span>
                        <Progress value={42} className="w-24" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Business</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">28%</span>
                        <Progress value={28} className="w-24" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Design</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">18%</span>
                        <Progress value={18} className="w-24" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Marketing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">12%</span>
                        <Progress value={12} className="w-24" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Demographics</CardTitle>
                  <CardDescription>Age distribution of enrolled students</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={studentDemographics?.ageGroups || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.category}: ${entry.value}%`}
                      >
                        {(studentDemographics?.ageGroups || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Geographic Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Top countries by student enrollment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(studentDemographics?.geographic || []).map((item: any) => (
                      <div key={item.country} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">{item.country}</span>
                          <Badge variant="secondary">{item.students.toLocaleString()}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{item.percentage}%</span>
                          <Progress value={item.percentage} className="w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Student Retention & Lifetime Value</CardTitle>
                <CardDescription>Key metrics for student engagement and value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{studentDemographics?.retentionRate || 0}%</div>
                    <p className="text-sm text-gray-600 mt-1">Monthly Retention Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">${studentDemographics?.avgLifetimeValue || 0}</div>
                    <p className="text-sm text-gray-600 mt-1">Average Lifetime Value</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{studentDemographics?.avgCoursesPerStudent || 0}</div>
                    <p className="text-sm text-gray-600 mt-1">Courses per Student</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            {/* Weekly Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Engagement</CardTitle>
                <CardDescription>Student activity patterns over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementMetrics?.weeklyData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" fill="#6366F1" name="Active Students" />
                    <Bar dataKey="completed" fill="#10B981" name="Lessons Completed" />
                    <Bar dataKey="enrolled" fill="#F59E0B" name="New Enrollments" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                  <CardDescription>Key indicators of student engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Average Session Duration</p>
                          <p className="text-xs text-gray-500">How long students stay engaged</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{engagementMetrics?.metrics?.avgSessionDuration || 0} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <PlayCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Video Completion Rate</p>
                          <p className="text-xs text-gray-500">Percentage of videos watched fully</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{engagementMetrics?.metrics?.videoCompletionRate || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Quiz Participation</p>
                          <p className="text-xs text-gray-500">Students taking quizzes</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{engagementMetrics?.metrics?.quizParticipation || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium">Active Learners</p>
                          <p className="text-xs text-gray-500">Students active in last 7 days</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{engagementMetrics?.metrics?.activeLearners || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Peak Activity Times */}
              <Card>
                <CardHeader>
                  <CardTitle>Peak Activity Times</CardTitle>
                  <CardDescription>When your students are most active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(engagementMetrics?.peakTimes || []).map((slot: any) => (
                      <div key={slot.time}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{slot.time}</span>
                          <span className="text-xs text-gray-500">{slot.label}</span>
                        </div>
                        <Progress value={slot.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}