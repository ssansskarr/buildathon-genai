"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { TrendingDown, ArrowRight, DollarSign, Target, Users, Brain, Calculator, BarChart, Building, FileText } from 'lucide-react'
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
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className={`bg-[#0f1a2e] border border-[#2a3050] rounded-xl p-6 hover:border-blue-500/50 transition-all transform hover:scale-105 ${
            isIntersecting ? "animate-slide-up-stagger" : "opacity-0 translate-y-8"
          }`}
          style={{
            animationDelay: isIntersecting ? `${index * 100}ms` : "0ms",
            transitionDelay: isIntersecting ? `${index * 100}ms` : "0ms",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <div className="text-blue-400">{feature.icon}</div>
            </div>
            <h3 className="text-lg font-semibold">{feature.title}</h3>
          </div>
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
          className={`bg-[#0f1a2e] border border-[#2a3050] rounded-xl p-6 hover:border-blue-500/50 transition-all transform hover:scale-105 ${
            isIntersecting ? "animate-slide-up-stagger" : "opacity-0 translate-y-8"
          }`}
          style={{
            animationDelay: isIntersecting ? `${index * 200}ms` : "0ms",
            transitionDelay: isIntersecting ? `${index * 200}ms` : "0ms",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-semibold">{useCase.role}</h3>
          </div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Challenge:</h4>
            <p className="text-gray-400 text-sm">{useCase.challenge}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-2">Solution:</h4>
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
      icon: <BarChart className="h-5 w-5" />,
      title: "Cost Analysis & Reduction",
      description: "Identify tasks where AI can automate workflows to free up human resources and reduce operational costs.",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "LLM Selection Advisor",
      description: "Get tailored recommendations on the optimal LLM for your specific use case, balancing cost, latency, and quality.",
    },
    {
      icon: <Calculator className="h-5 w-5" />,
      title: "ROI Calculator",
      description: "Calculate AI implementation costs, ongoing inference expenses, and projected ROI for strategic planning.",
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Architecture Optimization",
      description: "Identify which agent actions consume credits and optimize your AI architecture to minimize costs.",
    },
  ]

  const useCases = [
    {
      role: "AI Developers",
      challenge: "Selecting cost-effective LLMs and optimizing agent performance",
      solution: "Access technical recommendations on architecture design and credit optimization strategies",
    },
    {
      role: "Product Managers",
      challenge: "Understanding AI implementation costs and business impact",
      solution: "Get clear ROI calculations and cost-benefit analysis for AI initiatives across functions",
    },
    {
      role: "Tech Leads",
      challenge: "Designing scalable AI systems within budget constraints",
      solution: "Receive guidance on cost-efficient architecture and optimal LLM selection",
    },
    {
      role: "Decision Makers",
      challenge: "Evaluating AI investments and total cost of ownership",
      solution: "Access comprehensive financial analysis for deploying AI across the organization",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0a101f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-blue-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 right-40 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-30"></div>
      </div>

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0a101f]/95 backdrop-blur-sm shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center animate-pulse">
                <Target className="h-4 w-4 text-white" />
              </div>
              <Link href="/" className="font-bold text-xl hover:text-blue-400 transition-colors">AIlign</Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">
                Features
              </a>
              <a href="#use-cases" className="text-gray-300 hover:text-blue-400 transition-colors">
                Use Cases
              </a>
              <Link href="/chat" className="text-blue-400 hover:text-blue-300 transition-colors">
                Open Advisor
              </Link>
            </div>
            <Button
              onClick={handleStartOptimization}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 transform hover:scale-105 transition-all"
            >
              Start AIligning
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 to-transparent opacity-30" />
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[#0a101f] to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#1a2035] border border-[#2a3050] rounded-full px-4 py-1 mb-6 animate-fade-in">
              <Target className="h-3 w-3 text-blue-400" />
              <span className="text-sm text-gray-300">Align AI investments with business outcomes</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-slide-up">
              Optimize Your{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                AI Investment
              </span>{" "}
              with AIlign
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up-delay">
              The intelligent advisor that helps business teams select the right LLMs, calculate implementation ROI, optimize agent architecture, and align AI costs with business value.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg px-8 py-3 text-lg font-medium transform hover:scale-105 transition-all animate-bounce-subtle"
                >
                  Start Your Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="absolute -top-8 -bottom-8 -left-8 -right-8 bg-gradient-to-br from-blue-900/10 to-blue-600/5 rounded-3xl blur-xl"></div>
            <div className="relative bg-[#0f1a2e] border border-[#2a3050] rounded-xl p-6 md:p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      </div>
                    <div>
                      <h3 className="text-lg font-semibold">AIlign Advisor</h3>
                      <p className="text-sm text-gray-400">Intelligent AI investment guidance</p>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                    Live Analysis
                  </div>
                </div>
                
                <div className="bg-[#0a101f] rounded-lg p-4 mb-4 border border-[#2a3050]">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                        </div>
                    <div className="bg-[#1a2035] rounded-lg p-3 text-sm">
                      <p>Which LLM should we use for our customer service AI that balances cost and quality?</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="bg-[#1a2035]/70 rounded-lg p-3 text-sm mb-2">
                        <p>Based on your customer service needs, I recommend:</p>
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                          <li>Using Claude Instant for initial query classification</li>
                          <li>GPT-3.5 Turbo for routine customer inquiries</li>
                          <li>Reserving GPT-4 for complex escalations only</li>
                        </ul>
                      </div>
                      <div className="bg-[#1a2035]/70 rounded-lg p-3 text-sm">
                        <p>This tiered approach reduces your monthly costs by <span className="text-red-400">58%</span> while maintaining <span className="text-blue-400">94%</span> customer satisfaction.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask about AI selection, ROI, architecture, or cost optimization..." 
                    className="w-full bg-[#1a2035]/50 border border-[#2a3050] rounded-full py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <path d="m22 2-7 20-4-9-9-4Z"></path>
                      <path d="M22 2 11 13"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg animate-pulse">
              AI Investment Analysis
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#050a15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Investment Alignment
              </span>{" "}
              Features
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive AI investment analysis tools designed to help business teams make informed decisions and optimize returns.
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
              Solutions for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Every Stakeholder
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Tailored insights for each role in your organization's AI implementation journey.
            </p>
          </div>

          <UseCasesGrid useCases={useCases} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/30 to-blue-700/30 rounded-2xl p-8 md:p-12 border border-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                  AIlign Your Business?
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Start your AI investment alignment journey today. Get personalized LLM recommendations, ROI calculations, and architectural guidance for cost-efficient AI deployment.
              </p>
              <Link href="/chat">
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg px-8 py-3 text-lg font-medium transform hover:scale-105 transition-all animate-pulse"
                >
                  Start Free Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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