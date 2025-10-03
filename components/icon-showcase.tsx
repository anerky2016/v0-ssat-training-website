import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Icon, 
  AcademicCap, 
  BookOpen, 
  Calculator, 
  ChartBar, 
  CheckCircle, 
  Clock, 
  Cog, 
  DocumentText, 
  ExclamationTriangle, 
  Fire, 
  LightBulb, 
  Pencil, 
  Play, 
  Star, 
  Trophy, 
  UserGroup, 
  XMark,
  Brain,
  Rocket,
  Target,
  Magic,
  Lightning,
  Award,
  Medal,
  Gem
} from '@/components/ui/icon'

export function IconShowcase() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">🎨 Professional Icon Showcase</h2>
        
        {/* Education Icons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AcademicCap size="lg" className="text-primary" />
              Education & Learning Icons
            </CardTitle>
            <CardDescription>
              Professional icons for educational content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <AcademicCap size="xl" className="text-primary mb-2" />
                <span className="text-sm font-medium">Academic Cap</span>
                <span className="text-xs text-muted-foreground">Heroicons</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <BookOpen size="xl" className="text-primary mb-2" />
                <span className="text-sm font-medium">Book Open</span>
                <span className="text-xs text-muted-foreground">Heroicons</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Calculator size="xl" className="text-primary mb-2" />
                <span className="text-sm font-medium">Calculator</span>
                <span className="text-xs text-muted-foreground">Heroicons</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <ChartBar size="xl" className="text-primary mb-2" />
                <span className="text-sm font-medium">Chart Bar</span>
                <span className="text-xs text-muted-foreground">Heroicons</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success & Achievement Icons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size="lg" className="text-accent" />
              Success & Achievement Icons
            </CardTitle>
            <CardDescription>
              Icons to celebrate student achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <CheckCircle size="xl" className="text-green-600 mb-2" />
                <span className="text-sm font-medium">Check Circle</span>
                <span className="text-xs text-muted-foreground">Success</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Trophy size="xl" className="text-yellow-600 mb-2" />
                <span className="text-sm font-medium">Trophy</span>
                <span className="text-xs text-muted-foreground">Achievement</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Star size="xl" className="text-yellow-500 mb-2" />
                <span className="text-sm font-medium">Star</span>
                <span className="text-xs text-muted-foreground">Excellence</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Award size="xl" className="text-purple-600 mb-2" />
                <span className="text-sm font-medium">Award</span>
                <span className="text-xs text-muted-foreground">Recognition</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy & Motivation Icons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fire size="lg" className="text-orange-500" />
              Energy & Motivation Icons
            </CardTitle>
            <CardDescription>
              Dynamic icons to energize students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Fire size="xl" className="text-orange-500 mb-2" />
                <span className="text-sm font-medium">Fire</span>
                <span className="text-xs text-muted-foreground">Energy</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Lightning size="xl" className="text-yellow-500 mb-2" />
                <span className="text-sm font-medium">Lightning</span>
                <span className="text-xs text-muted-foreground">Power</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Rocket size="xl" className="text-blue-500 mb-2" />
                <span className="text-sm font-medium">Rocket</span>
                <span className="text-xs text-muted-foreground">Launch</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Magic size="xl" className="text-purple-500 mb-2" />
                <span className="text-sm font-medium">Magic</span>
                <span className="text-xs text-muted-foreground">Wonder</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Tools Icons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain size="lg" className="text-blue-500" />
              Learning Tools Icons
            </CardTitle>
            <CardDescription>
              Icons for learning activities and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Brain size="xl" className="text-blue-500 mb-2" />
                <span className="text-sm font-medium">Brain</span>
                <span className="text-xs text-muted-foreground">Thinking</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Target size="xl" className="text-red-500 mb-2" />
                <span className="text-sm font-medium">Target</span>
                <span className="text-xs text-muted-foreground">Focus</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <LightBulb size="xl" className="text-yellow-500 mb-2" />
                <span className="text-sm font-medium">Light Bulb</span>
                <span className="text-xs text-muted-foreground">Ideas</span>
              </div>
              <div className="flex flex-col items-center p-4 border rounded-lg">
                <Pencil size="xl" className="text-gray-600 mb-2" />
                <span className="text-sm font-medium">Pencil</span>
                <span className="text-xs text-muted-foreground">Writing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Library Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Icon Library Comparison</CardTitle>
            <CardDescription>
              Compare icons from different professional libraries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Academic Cap - Different Libraries</h4>
                <div className="flex gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <Icon name="academic-cap" library="heroicons" size="xl" className="text-primary" />
                    <span className="text-xs mt-1">Heroicons</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Icon name="academic-cap" library="reactIcons" size="xl" className="text-primary" />
                    <span className="text-xs mt-1">React Icons</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Icon name="academic-cap" library="phosphor" size="xl" className="text-primary" />
                    <span className="text-xs mt-1">Phosphor</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Calculator - Different Libraries</h4>
                <div className="flex gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <Icon name="calculator" library="heroicons" size="xl" className="text-primary" />
                    <span className="text-xs mt-1">Heroicons</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Icon name="calculator" library="reactIcons" size="xl" className="text-primary" />
                    <span className="text-xs mt-1">React Icons</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Icon name="calculator" library="phosphor" size="xl" className="text-primary" />
                    <span className="text-xs mt-1">Phosphor</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
