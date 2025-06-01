"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrendingDown, ArrowRight, DollarSign, Target, Users, Brain, Calculator } from 'lucide-react'
import { Button } from "@/components/ui/button"

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  return [ref, isIntersecting]
}

const FeaturesGrid = ({ features }) => {
  const [ref, isIntersecting] = useIntersectionObserver()

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`bg-[#171717] border border-[#2a2a2a] rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-900/10 transform hover:scale-105 group ${
            isIntersecting ? "animate-slide-up-stagger" : "opacity-0 translate-y-8"
          }`}
          style={{
            animationDelay: isIntersecting ? `${index * 150}ms` : "0ms",
            transitionDelay: isIntersecting ? `${index * 150}ms` : "0ms",
          }}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <div className="text-emerald-400">{feature.icon}</div>
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-400">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}

const UseCasesGrid = ({ useCases }) => {
  const [ref, isIntersecting] = useIntersectionObserver()

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {useCases.map((useCase, index) => (
        <div
          key={index}
          className={`bg-[#171717] border border-[#2a2a2a] rounded-xl p-6 hover:border-emerald-500/50 transition-all transform hover:scale-105 ${
            isIntersecting ? "animate-slide-up-stagger" : "opacity-0 translate-y-8"
          }`}
          style={{
            animationDelay: isIntersecting ? `${index * 200}ms` : "0ms",
            transitionDelay: isIntersecting ? `${index * 200}ms` : "0ms",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-emerald-400" />
            <h3 className="text-xl font-semibold">{useCase.role}</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Challenge:</h4>
            <p className="text-gray-400 text-sm">{useCase.challenge}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-emerald-400 mb-2">Solution:</h4>
            <p className="text-gray-300 text-sm">{useCase.solution}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleStartOptimization = () => {
    router.push("/chat")
  }

  const features = [
    {
      icon: <TrendingDown className="h-5 w-5" />,
      title: "Cost Reduction Analysis",
      description: "Identify which tasks AI can automate to reduce operational costs and free up human resources.",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "LLM Selection Advisor",
      description: "Get recommendations on the optimal LLM for your use case, balancing cost, latency, and quality.",
    },
    {
      icon: <Calculator className="h-5 w-5" />,
      title: "ROI Calculator",
      description: "Calculate implementation costs, inference costs, and projected ROI for AI agent deployments.",
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Agent Architecture",
      description: "Optimize your AI agent architecture to minimize credit consumption and maximize efficiency.",
    },
  ]

  const useCases = [
    {
      role: "AI Developers",
      challenge: "Selecting cost-effective LLMs and optimizing agent performance",
      solution: "Get technical recommendations on model selection and architecture optimization",
    },
    {
      role: "Product Managers",
      challenge: "Understanding AI implementation costs and business value",
      solution: "Receive clear ROI calculations and cost-benefit analysis for AI initiatives",
    },
    {
      role: "Tech Leads",
      challenge: "Designing scalable AI systems within budget constraints",
      solution: "Access architectural guidance and cost optimization strategies",
    },
    {
      role: "Decision Makers",
      challenge: "Evaluating AI investments and understanding total cost of ownership",
      solution: "Get comprehensive financial analysis and strategic recommendations",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-emerald-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 right-40 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0f0f0f]/95 backdrop-blur-sm shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center animate-pulse">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <Link href="/" className="font-bold text-xl hover:text-emerald-400 transition-colors">AI Cost Optimizer</Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Features
              </a>
              <a href="#use-cases" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Use Cases
              </a>
              <Link href="/chat" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Open Chat
              </Link>
            </div>
            <Button
              onClick={handleStartOptimization}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 transform hover:scale-105 transition-all"
            >
              Start Optimizing
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-900/20 to-transparent opacity-30" />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-1 mb-6 animate-fade-in">
              <TrendingDown className="h-3 w-3 text-emerald-400" />
              <span className="text-sm text-gray-300">Powered by Amazon Nova Models & AWS Bedrock</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
              Optimize Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                AI Costs
              </span>{" "}
              with Intelligence
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up-delay">
              Enterprise AI Cost Optimization Advisor that helps you reduce operational costs, select optimal LLMs,
              calculate ROI, and architect efficient AI agents. Make data-driven decisions for your AI investments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white rounded-lg px-8 py-3 text-lg font-medium transform hover:scale-105 transition-all animate-bounce-subtle"
                >
                  Start Cost Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="aspect-[16/9] rounded-xl overflow-hidden border border-[#2a2a2a] shadow-2xl shadow-emerald-900/20 transform hover:scale-105 transition-all duration-500">
              <div className="w-full h-full bg-[#171717] relative">
                {/* AI Cost Dashboard Preview */}
                <div className="absolute inset-0 flex">
                  {/* Sidebar */}
                  <div className="w-64 bg-[#171717] border-r border-[#2a2a2a] hidden md:block">
                    <div className="p-4 border-b border-[#2a2a2a]">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-lg h-10 w-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">New Analysis</span>
                      </div>
                    </div>
                    <div className="p-3">
                      {["Cost Analysis", "LLM Comparison", "ROI Calculator"].map((item, i) => (
                        <div key={i} className="mb-2 p-2 bg-[#1a1a1a] rounded-lg h-12 flex items-center">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Main Dashboard */}
                  <div className="flex-1 flex flex-col">
                    <div className="h-12 border-b border-[#2a2a2a] flex items-center px-4">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mr-2"></div>
                      <div className="h-4 w-40 bg-[#2a2a2a] rounded"></div>
                    </div>
                    <div className="flex-1 p-4 overflow-hidden">
                      {/* Cost Charts */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <div className="h-3 w-20 bg-[#2a2a2a] rounded mb-2"></div>
                          <div className="h-16 bg-gradient-to-t from-emerald-500/20 to-emerald-500/5 rounded"></div>
                        </div>
                        <div className="bg-[#1a1a1a] rounded-lg p-3">
                          <div className="h-3 w-24 bg-[#2a2a2a] rounded mb-2"></div>
                          <div className="h-16 bg-gradient-to-t from-emerald-400/20 to-emerald-400/5 rounded"></div>
                        </div>
                      </div>
                      {/* Recommendations */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <div className="h-2 bg-[#2a2a2a] rounded flex-1"></div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <div className="h-2 bg-[#2a2a2a] rounded flex-1"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
              Real-time Cost Analysis
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligent{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                Cost Optimization
              </span>{" "}
              Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive AI cost analysis tools designed for enterprise teams to make informed decisions about AI
              investments and implementations.
            </p>
          </div>

          <FeaturesGrid features={features} />
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                Enterprise Teams
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tailored solutions for different roles in your organization, from technical teams to executive decision
              makers.
            </p>
          </div>

          <UseCasesGrid useCases={useCases} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-700/30 rounded-2xl p-8 md:p-12 border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                  Optimize Your AI Costs?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Start your AI cost optimization journey today. Get personalized recommendations, ROI calculations, and
                architectural guidance from our intelligent advisor.
              </p>
              <Link href="/chat">
                <Button
                  className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white rounded-lg px-8 py-3 text-lg font-medium transform hover:scale-105 transition-all animate-pulse"
                >
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0a0a0a] border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">AI Cost Optimizer</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">Home</Link>
              <Link href="/chat" className="text-gray-400 hover:text-emerald-400 transition-colors">Chat</Link>
              <a href="#features" className="text-gray-400 hover:text-emerald-400 transition-colors">Features</a>
              <a href="#use-cases" className="text-gray-400 hover:text-emerald-400 transition-colors">Use Cases</a>
            </div>
            <div className="mt-4 md:mt-0 text-gray-500 text-sm">
              © 2024 AI Cost Optimizer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-up-stagger {
          from { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes bounce-subtle {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
          60% {
            transform: translateY(-2px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up-stagger {
          animation: slide-up-stagger 0.8s ease-out both;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite;
        }
      `}</style>
    </div>
  )
}