"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Code,
  Brain,
  Users,
  TrendingUp,
  Star,
  Award,
  Target,
  Zap,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react"

const Home = () => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: "Resource Sharing",
      description: "Upload and discover educational resources including PDFs, links, and blogs.",
      link: "/resources",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Code,
      title: "DSA Practice",
      description: "Practice Data Structures and Algorithms with topic-wise questions and progress tracking.",
      link: "/dsa-practice",
      gradient: "from-blue-600 to-blue-700",
    },
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Generate custom quizzes and take AI-conducted interviews to test your skills.",
      link: "/ai-module",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Learn from peers, rate resources, and contribute to the learning community.",
      link: "/resources",
      gradient: "from-blue-600 to-blue-700",
    },
  ]

  // const stats = [
  //   { icon: Users, label: "Active Users", value: "10K+", color: "text-blue-400" },
  //   { icon: BookOpen, label: "Resources Shared", value: "5K+", color: "text-blue-500" },
  //   { icon: Code, label: "DSA Problems", value: "500+", color: "text-blue-400" },
  //   { icon: TrendingUp, label: "Quizzes Generated", value: "2K+", color: "text-blue-500" },
  // ]

  // const testimonials = [
  //   {
  //     name: "Alex Chen",
  //     role: "Software Engineer",
  //     text: "This platform helped me land my dream job at Google!",
  //     rating: 5,
  //   },
  //   {
  //     name: "Sarah Johnson",
  //     role: "CS Student",
  //     text: "The DSA practice section is incredibly comprehensive.",
  //     rating: 5,
  //   },
  //   {
  //     name: "Mike Rodriguez",
  //     role: "Data Scientist",
  //     text: "AI interviews prepared me for real technical interviews.",
  //     rating: 5,
  //   },
  //   {
  //     name: "Emily Davis",
  //     role: "Full Stack Developer",
  //     text: "Resource sharing feature saved me countless hours.",
  //     rating: 5,
  //   },
  //   { name: "David Kim", role: "Backend Engineer", text: "The community here is amazing and supportive.", rating: 5 },
  //   { name: "Lisa Wang", role: "Frontend Developer", text: "Best learning platform I have ever used!", rating: 5 },
  // ]

  // const learningPaths = [
  //   {
  //     icon: Target,
  //     title: "Beginner Path",
  //     description: "Start your coding journey",
  //     duration: "3 months",
  //     courses: 12,
  //   },
  //   { icon: Zap, title: "Advanced Path", description: "Master complex algorithms", duration: "6 months", courses: 24 },
  //   { icon: Award, title: "Interview Prep", description: "Ace your tech interviews", duration: "2 months", courses: 8 },
  // ]

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Hero Section with Enhanced Parallax Effect */}
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-pulse delay-2000"></div>

          {/* Floating Cards */}
          {/* <div className="absolute top-32 right-20 w-64 h-40 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 animate-float">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Code size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-800">DSA Practice</span>
            </div>
            <p className="text-sm text-gray-600">500+ problems solved by our community</p>
          </div> */}

          {/* <div className="absolute bottom-40 left-16 w-72 h-44 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100 p-6 animate-float-delayed">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Brain size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-800">AI Learning</span>
            </div>
            <p className="text-sm text-gray-600">Personalized quizzes and interview prep</p>
          </div> */}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <div
            className="transform transition-transform duration-1000"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              Your Ultimate Learning Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-4xl leading-relaxed">
              A comprehensive platform designed to accelerate your academic and professional growth with AI-powered
              tools, peer-shared resources, and dedicated DSA practice.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link
                to="/resources"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                Explore Resources
              </Link>
              <Link
                to="/dsa-practice"
                className="px-8 py-4 border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Start Practicing
              </Link>
            </div>
          </div>

          
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4 text-gray-800">Key Features</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Discover powerful tools designed to enhance your learning experience and accelerate your growth
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group bg-white border border-gray-200 rounded-xl p-8 transition-all duration-300 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2"
                >
                  <div
                    className={`mb-6 w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <Link
                    to={feature.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-300"
                  >
                    Learn More <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Learning Paths Section
      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-800">Choose Your Learning Path</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => {
              const Icon = path.icon
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                >
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{path.title}</h3>
                  <p className="text-gray-600 mb-6">{path.description}</p>
                  <div className="flex justify-between text-sm text-gray-500 mb-6">
                    <span>Duration: {path.duration}</span>
                    <span>{path.courses} courses</span>
                  </div>
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300">
                    Start Learning
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div> */}

      

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                CodeNest
              </h3>              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering learners worldwide with AI-powered tools, comprehensive resources, and a supportive
                community. Your success is our mission.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <Github size={20} className="text-gray-300 hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <Twitter size={20} className="text-gray-300 hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <Linkedin size={20} className="text-gray-300 hover:text-white" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <Mail size={20} className="text-gray-300 hover:text-white" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/resources" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="/dsa-practice" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    DSA Practice
                  </Link>
                </li>
                <li>
                  <Link to="/ai-module" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    AI Module
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-300">© 2024 CodeNest. All rights reserved. Built with ❤️ for learners worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
