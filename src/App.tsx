import { lazy, Suspense, useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, MouseEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import './App.css'

const projects = [
  {
    name: 'Stock Trading',
    type: 'Java desktop application',
    summary:
      'A Swing/AWT-based stock trading app with authentication, buy/sell flows, portfolio tracking, and transaction management.',
    details: [
      'Integrated a relational SQL database for persistent storage.',
      'Used linked lists and circular queues to support backend processing.',
      'Added real-time stock price updates and custom exception handling.',
    ],
    tags: ['Java', 'Swing', 'SQL', 'Data Structures'],
    link: 'https://github.com/Meetpatel21-pug/stock-trading-app',
  },
  {
    name: 'ATS Checker',
    type: 'Streamlit web app',
    summary:
      'A resume analysis tool that scores ATS compatibility against job descriptions with NLP-driven feedback.',
    details: [
      'Implemented keyword matching, semantic similarity, and skill-gap analysis.',
      'Extracted content from PDF, DOCX, and TXT files for multi-format support.',
      'Generated actionable improvement suggestions with AI-assisted guidance.',
    ],
    tags: ['Python', 'Streamlit', 'NLP', 'PDF / DOCX'],
    link: 'https://github.com/Meetpatel21-pug/ATS_project',
  },
  {
    name: 'EzyHeal',
    type: 'Full-stack healthcare commerce app',
    summary:
      'A Flask and SQLite platform for pharmacy workflows, appointments, OTP-based authentication, and order management.',
    details: [
      'Built secure login and password reset flows with SHA256 hashing and SMTP OTP verification.',
      'Created hospital appointment booking with real-time slot checks and cancellation support.',
      'Designed RESTful endpoints for authentication, orders, users, and appointments.',
    ],
    tags: ['Flask', 'SQLite', 'JavaScript', 'REST API'],
    link: 'https://github.com/Meetpatel21-pug/EzyHeal-Healthcare-Web-Application',
  },
]

const skillGroups = [
  {
    title: 'Programming languages',
    items: ['Java', 'Python', 'HTML', 'CSS'],
  },
  {
    title: 'Libraries and frameworks',
    items: ['JavaScript', 'Bootstrap', 'Flask', 'Pandas', 'NumPy', 'Matplotlib', 'Tailwind'],
  },
  {
    title: 'Tools and platforms',
    items: ['Git', 'VS Code', 'IntelliJ', 'Jupyter Notebook'],
  },
  {
    title: 'Databases',
    items: ['MySQL', 'SQLite'],
  },
]

const certifications = [
  {
    title: 'Introduction to Java',
    provider: 'Coursera',
    link: 'https://coursera.org/share/c375bc49ebf3dfa77289a0cdcc0c8762',
  },
  {
    title: 'Inheritance and Data Structures in Java',
    provider: 'Coursera',
    link: 'https://coursera.org/share/4352b5400b353e5fde9afdfd6b3b078e',
  },
  {
    title: 'Introduction to HTML, CSS, and JavaScript',
    provider: 'Coursera',
    link: 'https://coursera.org/share/42c7062be1c7190118cad83ed2c3ea21',
  },
  {
    title: 'Generative AI: Introduction and Applications',
    provider: 'Coursera',
    link: 'https://coursera.org/share/a98ccd8564213ef03998692aafcc6ae8',
  },
]

const metrics = [
  { value: '3', label: 'portfolio projects' },
  { value: '4', label: 'certifications' },
  { value: '2', label: 'database systems' },
  { value: '1', label: 'computer engineering degree path' },
]

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
]

const PortfolioScene = lazy(() => import('./PortfolioScene'))

const appear = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

type ContactFormState = {
  name: string
  email: string
  subject: string
  message: string
}

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

function App() {
  const reduceMotion = useReducedMotion()
  const [activeSection, setActiveSection] = useState('hero')
  const [contactForm, setContactForm] = useState<ContactFormState>(initialFormState)
  const [formNotice, setFormNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.href.replace('#', ''))
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id)
        }
      },
      {
        rootMargin: '-30% 0px -45% 0px',
        threshold: [0.2, 0.35, 0.5, 0.65],
      },
    )

    sections.forEach((section) => observer.observe(section))

    const updateHomeState = () => {
      if (window.scrollY < 120) {
        setActiveSection('hero')
      }
    }

    updateHomeState()
    window.addEventListener('scroll', updateHomeState, { passive: true })

    return () => {
      sections.forEach((section) => observer.unobserve(section))
      observer.disconnect()
      window.removeEventListener('scroll', updateHomeState)
    }
  }, [])

  const handleFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setContactForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = contactForm.name.trim()
    const email = contactForm.email.trim()
    const subject = contactForm.subject.trim()
    const message = contactForm.message.trim()

    if (!name || !email || !message) {
      setFormNotice('Please fill in name, email, and message before sending.')
      return
    }

    setIsSubmitting(true)
    setFormNotice('Sending your message...')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || 'Message send failed')
      }

      setFormNotice('Message sent successfully. I will get back to you soon.')
      setContactForm(initialFormState)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setFormNotice(
        message
          ? `${message} If needed, email me directly at meetparsana211@gmail.com.`
          : 'Unable to send message right now. Please email me directly at meetparsana211@gmail.com.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResumeDownload = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    const link = document.createElement('a')
    link.href = '/Meet_Parsana_Resume.pdf'
    link.download = 'Meet_Parsana_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <main className="page-shell">
      <div className="background background-one" aria-hidden="true" />
      <div className="background background-two" aria-hidden="true" />
      <div className="background background-grid" aria-hidden="true" />

      <header className="topbar">
        <a className="brand" href="#hero">
          Meet Parsana
        </a>
        <nav aria-label="Primary" className="topnav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setActiveSection(item.href.replace('#', ''))}
              className={activeSection === item.href.replace('#', '') ? 'is-active' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero section" id="hero">
        <motion.div
          className="hero-copy"
          variants={appear}
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          <p className="eyebrow">Portfolio website</p>
          <h1>
            Building dependable software with Java, Python, and modern web tools.
          </h1>
          <p className="lede">
            Computer Engineering student at LJ University in Ahmedabad, focused on
            practical systems, polished interfaces, and applications that are easy
            to use and maintain.
          </p>
          <div className="cta-row">
            <a className="button button-primary" href="#projects">
              Explore projects
            </a>
            <a
              className="button button-secondary"
              href="mailto:meetparsana211@gmail.com"
            >
              Contact me
            </a>
          </div>

          <ul className="metric-grid" aria-label="Portfolio highlights">
            {metrics.map((metric) => (
              <li key={metric.label} className="metric-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="hero-visual"
          variants={appear}
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
          transition={{ delay: 0.15 }}
        >
          <div className="visual-frame">
            <div className="visual-glow" aria-hidden="true" />
            <Suspense fallback={<div className="scene-fallback">Loading 3D experience...</div>}>
              <PortfolioScene />
            </Suspense>
          </div>

          <div className="status-panel">
            <p className="status-label">Current focus</p>
            <p>
              Full-stack application design, 3D motion, and clean data handling.
            </p>
          </div>
        </motion.div>
      </section>

      <section className="section section-wide" id="projects">
        <motion.div
          className="section-heading"
          variants={appear}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          <p className="eyebrow">Projects</p>
          <h2>Selected work from the resume</h2>
        </motion.div>

        <motion.div
          className="project-grid"
          variants={staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projects.map((project) => (
            <motion.article
              key={project.name}
              className="project-card"
              variants={appear}
            >
              <div className="project-card-top">
                <div>
                  <p className="project-type">{project.type}</p>
                  <h3>{project.name}</h3>
                </div>
                <a className="inline-link" href={project.link} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </div>
              <p className="project-summary">{project.summary}</p>
              <ul className="project-details">
                {project.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className="section split-section" id="skills">
        <motion.div
          className="section-heading"
          variants={appear}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="eyebrow">Skills</p>
          <h2>Technical stack and tooling</h2>
        </motion.div>

        <motion.div
          className="skills-grid"
          variants={staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {skillGroups.map((group) => (
            <motion.div
              key={group.title}
              className="skill-card"
              variants={appear}
            >
              <h3>{group.title}</h3>
              <div className="tag-row tag-row-wrap">
                {group.items.map((item) => (
                  <span key={item} className="tag tag-soft">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="section split-section" id="certifications">
        <motion.div
          className="section-heading"
          variants={appear}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p className="eyebrow">Certifications</p>
          <h2>Coursework and credential highlights</h2>
        </motion.div>

        <motion.div
          className="cert-grid"
          variants={staggerContainer}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {certifications.map((item) => (
            <motion.a
              key={item.title}
              className="cert-card"
              href={item.link}
              target="_blank"
              rel="noreferrer"
              variants={appear}
            >
              <span className="cert-provider">{item.provider}</span>
              <h3>{item.title}</h3>
              <span className="inline-link">View certificate</span>
            </motion.a>
          ))}
        </motion.div>
      </section>

      <section className="section contact-section" id="contact">
        <motion.div
          className="contact-card"
          variants={appear}
          initial={reduceMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          <div className="contact-left">
            <p className="eyebrow">Contact</p>
            <h2>Let’s turn the resume into a live portfolio</h2>

            <a
              className="resume-download"
              href="/Meet_Parsana_Resume.pdf"
              download
              onClick={handleResumeDownload}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2v6h6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12v6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="m9.5 15.5 2.5 2.5 2.5-2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download Resume
            </a>

            <div className="contact-list">
              <a href="tel:7211199976">7211199976</a>
              <a href="mailto:meetparsana211@gmail.com">meetparsana211@gmail.com</a>
              <a href="https://www.linkedin.com/in/meet-parsana-1194a6313" target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a href="https://github.com/Meetpatel21-pug" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>

          <div className="contact-content">
            <form className="contact-form" onSubmit={handleFormSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleFormChange}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleFormChange}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Subject
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleFormChange}
                  placeholder="Project discussion"
                />
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Tell me what you would like to build"
                />
              </label>
              <button type="submit" className="button button-primary contact-submit">
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
              {formNotice ? <p className="form-notice">{formNotice}</p> : null}
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  )
}

export default App
