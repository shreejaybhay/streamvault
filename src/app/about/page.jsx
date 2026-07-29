"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Mail, Linkedin, Twitter, ChevronRight, Code2, Database, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group relative overflow-hidden rounded-2xl 
    bg-foreground/[0.02] border border-gray-400/10
    shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="p-8 relative z-10">
      <div className="mb-6 w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-6 h-6 text-primary/80" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-foreground/90 group-hover:text-primary/90 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-foreground/70 leading-relaxed">
        {description}
      </p>
    </div>
  </motion.div>
);

export default function AboutPage() {
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGithubData = async () => {
      try {
        const response = await fetch('https://api.github.com/users/shreejaybhay');
        const data = await response.json();
        setGithubData(data);
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGithubData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary/[0.03] border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-primary/[0.03] border-t-transparent animate-spin-slow" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] mt-20 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at center, var(--primary) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        
        <div className="relative z-10 text-center responsive-container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary">
              StreamVault
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Experience the future of streaming with our cutting-edge platform. 
              Seamlessly browse and enjoy your favorite movies, TV shows, and anime.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 rounded-full 
                  bg-primary text-black font-semibold 
                  border border-gray-400/10
                  hover:bg-primary/90 transition-all duration-300 
                  transform hover:scale-105"
              >
                Explore Now
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="responsive-container px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center mb-16"
          >
            Cutting-Edge Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Code2}
              title="Modern Architecture"
              description="Built with Next.js 14, leveraging the latest web technologies for optimal performance."
              delay={0.1}
            />
            <FeatureCard
              icon={Database}
              title="Rich Content Library"
              description="Access a vast collection of carefully curated movies, shows, and anime titles."
              delay={0.2}
            />
            <FeatureCard
              icon={Sparkles}
              title="Smart Features"
              description="Enjoy personalized recommendations and create your custom watchlist."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-20 relative">
        <div className="responsive-container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative p-[1px] rounded-2xl">
              <div className="relative rounded-2xl 
                bg-foreground/[0.02] border border-gray-400/10
                backdrop-blur-sm p-8 md:p-10 
                shadow-[0_4px_24px_-12px_rgba(0,0,0,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/3 to-transparent rounded-2xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-semibold mb-6 text-center text-primary/90">
                    Educational Purpose Notice
                  </h3>
                  <div className="space-y-4 text-center">
                    <p className="text-lg text-foreground/80">
                      StreamVault is a demonstration project showcasing modern web development practices.
                    </p>
                    <p className="text-foreground/70">
                      Please support official content platforms and creators for actual streaming services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        <div className="responsive-container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative w-56 h-56"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-2xl blur-2xl opacity-50" />
              <Image
                src={githubData?.avatar_url || "https://via.placeholder.com/224"}
                alt="Shree Jaybhay"
                fill
                className="rounded-2xl object-cover shadow-xl"
                priority
              />
            </motion.div>

            <div className="flex-1 space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Shree Jaybhay</h2>
                <p className="text-xl text-primary/80">Full Stack Developer</p>
              </div>
              
              <p className="text-foreground/70 leading-relaxed">
                Passionate about creating seamless web experiences and pushing the boundaries
                of modern web development. StreamVault represents my vision for the future
                of streaming platforms.
              </p>

              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Github, href: "https://github.com/shreejaybhay", label: "GitHub" },
                  { icon: Mail, href: "mailto:contact@shreejaybhay.com", label: "Email" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full 
                      bg-foreground/5 border border-gray-400/10
                      hover:bg-primary/10 hover:border-primary/20
                      transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5" />
                    <span className="text-foreground/90">{social.label}</span>
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { label: "Repositories", value: githubData?.public_repos || 0 },
                  { label: "Followers", value: githubData?.followers || 0 },
                  { label: "Following", value: githubData?.following || 0 },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-foreground/[0.02] 
                      border border-gray-400/10
                      shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] 
                      hover:shadow-[0_4px_12px_-6px_rgba(0,0,0,0.2)] 
                      transition-all duration-300 text-center"
                  >
                    <div className="text-2xl font-bold text-primary/90 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-foreground/70">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}