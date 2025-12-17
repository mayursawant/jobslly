import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Briefcase, GraduationCap, Award, FileText, Mail, Sparkles, MapPin, Users, Phone, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Helmet } from 'react-helmet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const StudentProfiles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProfiles, setExpandedProfiles] = useState({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const profiles = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      age: 27,
      category: "CLINICAL DRUG DEVELOPMENT",
      role: "Clinical Research Associate (CRA) – Entry / Associate Level",
      avatar: "PS",
      avatarColor: "from-purple-500 to-pink-500",
      education: "Doctor of Pharmacy (PharmD)",
      experience: "2+ years",
      location: "Mumbai, India",
      highlights: ["ICH-GCP Certified", "Clinical Trial Operations", "EDC/eCRF Proficient"],
      summary: "27-year-old Doctor of Pharmacy (PharmD) graduate with over two years of hands-on clinical experience in a corporate hospital environment, including one year of structured clinical internship. The candidate has collaborated closely with physicians and multidisciplinary healthcare teams, demonstrating strong expertise in patient-centric care, medication management, and clinical decision support.",
      competencies: [
        "Clinical trial operations (Phase I–IV)",
        "ICH-GCP, protocol adherence & site compliance",
        "Investigator site coordination & monitoring support",
        "Source data verification & CRF review",
        "Trial documentation (ISF, TMF, essential documents)"
      ],
      systems: [
        "EDC / eCRF concepts",
        "Risk-Based Monitoring (RBM) fundamentals"
      ],
      idealFit: [
        "CRA (Trainee / Associate)",
        "Clinical Operations Associate",
        "Site Management / Trial Coordination roles"
      ]
    },
    {
      id: 2,
      name: "Rahul Verma",
      age: 26,
      category: "CLINICAL DRUG DEVELOPMENT",
      role: "Clinical Development Scientist – Associate Level",
      avatar: "RV",
      avatarColor: "from-blue-500 to-cyan-500",
      education: "BPharm & MPharm (Pharmacology), GPAT Qualified",
      experience: "2 years",
      location: "Bangalore, India",
      highlights: ["Published Author", "Preclinical Research", "Data Analysis Expert"],
      summary: "26-year-old BPharm and MPharm (Pharmacology) graduate, GPAT-qualified, with 2 years of academic and research experience at the Bachelor of Pharmacy level. The candidate brings a strong foundation in pharmacology, translational research, and data interpretation, and is now prepared to transition into clinical development roles within the pharmaceutical industry.",
      competencies: [
        "Hands-on experience in preclinical pharmacology, including animal handling and drug activity evaluation",
        "Strong understanding of study design, data collection, and result interpretation",
        "Experience with research-related software tools and experimental documentation",
        "Author of two peer-reviewed research publications, demonstrating familiarity with scientific writing, data analysis, and publication standards"
      ],
      clinicalReadiness: [
        "Clinical protocol and synopsis review",
        "Translational linkage between preclinical findings and clinical rationale",
        "Literature review and evidence synthesis",
        "Clinical data interpretation and scientific documentation support"
      ],
      idealFit: [
        "Clinical Development Scientist (Associate / Junior)",
        "Clinical Research Scientist (Entry Level)",
        "Translational Research Associate",
        "Clinical Documentation / Scientific Support Roles"
      ]
    },
    {
      id: 3,
      name: "Dr. Ananya Reddy",
      age: 27,
      category: "CLINICAL DRUG DEVELOPMENT",
      role: "Pharmacovigilance Case Processing Associate – Entry Level",
      avatar: "AR",
      avatarColor: "from-emerald-500 to-teal-500",
      education: "Doctor of Pharmacy (PharmD)",
      experience: "1 year clinical internship",
      location: "Hyderabad, India",
      highlights: ["ADR Monitoring Expert", "Oracle Argus", "PvPI Experience"],
      summary: "Female Doctor of Pharmacy (PharmD) graduate with one year of structured clinical internship and strong practical exposure to drug safety and pharmacovigilance activities. The candidate has developed a solid foundation in adverse drug reaction (ADR) monitoring and regulatory safety reporting and is ready to transition into entry-level pharmacovigilance roles.",
      competencies: [
        "Very strong fundamentals in adverse drug reactions (ADR) and adverse event (AE) reporting",
        "Hands-on experience with CDSCO ADR Case Report Forms",
        "Actively involved in reporting multiple ADR cases during clinical internship",
        "Experience working with ADR Monitoring Centres (AMCs) under the Pharmacovigilance Programme of India (PvPI)",
        "Practical exposure to causality assessment and safety documentation"
      ],
      systems: [
        "Working knowledge of pharmacovigilance safety databases, including Oracle Argus (foundational level)",
        "Familiarity with standard PV workflows and regulatory timelines"
      ],
      idealFit: [
        "Pharmacovigilance Case Processing Associate",
        "Drug Safety Associate",
        "PV Executive (Entry Level)"
      ]
    },
    {
      id: 4,
      name: "Dr. Kavita Menon",
      age: 31,
      category: "CLINICAL DRUG DEVELOPMENT",
      role: "Pharmacovigilance Scientist / Medical Reviewer - Junior Level",
      avatar: "KM",
      avatarColor: "from-rose-500 to-orange-500",
      education: "MBBS",
      experience: "3 years (1 year internship + 2 years clinical practice)",
      location: "Chennai, India",
      highlights: ["Clinical Expertise", "Medical Writing", "Safety Assessment"],
      summary: "31-year-old female MBBS graduate with three years of total clinical experience, including one year of compulsory medical internship and two years of independent clinical practice in a rural healthcare setting. The candidate brings strong hands-on exposure to patient care and clinical decision-making and is now motivated to transition into a corporate pharmacovigilance and drug safety role.",
      competencies: [
        "Extensive experience in identifying, managing, and documenting adverse events and drug-related side effects in real-world clinical practice",
        "Strong understanding of patient safety principles, clinical risk assessment, and therapeutic decision-making",
        "Exposure to medication-related safety issues across diverse patient populations"
      ],
      pvReadiness: [
        "Medical review of ICSRs and clinical case narratives",
        "Clinical assessment of adverse events, seriousness, and expectedness",
        "Support for benefit–risk evaluation and safety signal assessment (foundational level)",
        "Review of safety information for labeling and regulatory compliance (support role)"
      ],
      idealFit: [
        "Pharmacovigilance Scientist (Junior)",
        "Drug Safety Physician (Junior)",
        "Medical Reviewer - Drug Safety"
      ]
    },
    {
      id: 5,
      name: "Dr. Sneha Patel",
      age: 26,
      category: "HEOR & MEDICAL AFFAIRS",
      role: "HEOR / Real-World Evidence (RWE) Associate - Entry Level",
      avatar: "SP",
      avatarColor: "from-indigo-500 to-purple-500",
      education: "Doctor of Pharmacy (PharmD)",
      experience: "1 year clinical pharmacy experience",
      location: "Ahmedabad, India",
      highlights: ["Published Author", "SLR Expert", "HEOR Specialized"],
      summary: "26-year-old Doctor of Pharmacy (PharmD) graduate with a strong academic and research-driven orientation toward Health Economics and Outcomes Research (HEOR) and real-world evidence generation. The candidate developed a focused interest in pharmacoeconomics and pharmacoepidemiology during the fourth year of the PharmD program and has since built a solid foundation in evidence-based research and clinical outcomes assessment.",
      competencies: [
        "Strong understanding of pharmacoeconomic concepts and outcomes-based analysis",
        "Foundational knowledge of pharmacoepidemiology and real-world data interpretation",
        "Hands-on experience in systematic literature reviews (SLR)",
        "Experience in clinical evidence synthesis for healthcare decision-making",
        "Familiarity with clinical, humanistic, and economic outcomes assessment"
      ],
      publications: [
        "Author of one review article and one original research article",
        "Demonstrated capability in scientific writing, data interpretation, and publication standards",
        "Experience in synthesizing clinical evidence to support research conclusions and value discussions"
      ],
      idealFit: [
        "HEOR Associate",
        "Real-World Evidence (RWE) Analyst - Junior",
        "Outcomes Research Associate",
        "Evidence Synthesis / Market Access Support Roles"
      ]
    },
    {
      id: 6,
      name: "Dr. Meera Shah",
      age: 30,
      category: "HEOR & MEDICAL AFFAIRS",
      role: "Medical Affairs Scientific Associate – Entry Level",
      avatar: "MS",
      avatarColor: "from-cyan-500 to-blue-500",
      education: "MBBS (Georgia)",
      experience: "1 year medical internship",
      location: "Delhi, India",
      highlights: ["Medical Writing", "EBM Expert", "Scientific Communication"],
      summary: "30-year-old MBBS graduate from Georgia, with a strong interest in medical research, evidence-based medicine, and scientific communication. The candidate demonstrates excellent written communication skills and a clear motivation to build a career in Medical Affairs within the pharmaceutical industry.",
      competencies: [
        "Completed one year of compulsory medical internship at a medical college as part of the MBBS program",
        "Strong foundation in clinical medicine and therapeutic decision-making",
        "Exposure to academic medical environments and structured clinical training"
      ],
      capabilities: [
        "Strong interest in medical education and dissemination of scientific evidence",
        "Ability to interpret and communicate clinical data and medical literature",
        "Familiarity with principles of evidence-based medicine (EBM)",
        "Capable of preparing scientific content, literature summaries, and medical responses"
      ],
      idealFit: [
        "Medical Affairs Scientific Associate",
        "Medical Information Scientist",
        "Scientific Communications Associate"
      ]
    },
    {
      id: 7,
      name: "Dr. Pooja Kumar",
      age: 32,
      category: "HEOR & MEDICAL AFFAIRS",
      role: "Medical Science Liaison (MSL) – Entry Level",
      avatar: "PK",
      avatarColor: "from-pink-500 to-rose-500",
      education: "MBBS (Russia)",
      experience: "1 year rotating clinical internship + ICMR Research",
      location: "Pune, India",
      highlights: ["KOL Engagement", "Scientific Presenter", "ICMR Research"],
      summary: "32-year-old MBBS graduate from Russia, with completion of a one-year rotating clinical internship. The candidate combines strong clinical training with a clear interest in scientific exchange, evidence synthesis, and medical education, making her well suited for entry-level Medical Science Liaison roles.",
      competencies: [
        "Solid foundation in clinical medicine through structured rotational internship",
        "Worked on an ICMR-funded research project, demonstrating exposure to clinical research methodology",
        "Actively participated in research presentations, journal clubs, and scientific discussions during medical training"
      ],
      mslSkills: [
        "Strong ability to synthesize clinical evidence and translate complex data into clear, practical insights",
        "Experienced in creating scientific presentations (PPTs) tailored to diverse audiences",
        "Confident presenter with the ability to communicate scientific information in a simple and understandable manner"
      ],
      engagement: [
        "Highly outgoing and engaging personality with strong interpersonal skills",
        "Comfortable interacting with senior clinicians, researchers, and academic faculty",
        "Actively involved in online teaching and student engagement, reflecting strong educational and communication capabilities"
      ],
      idealFit: [
        "Medical Science Liaison (MSL – Trainee / Junior)",
        "Junior MSL",
        "Medical Scientific Executive (Field Medical Support)"
      ]
    },
    {
      id: 8,
      name: "Dr. Rajesh Iyer",
      age: 38,
      category: "SENIOR MEDICAL AFFAIRS LEADERSHIP",
      role: "Senior Medical Affairs Leader / Regional Medical Director",
      avatar: "RI",
      avatarColor: "from-blue-500 to-indigo-500",
      education: "MBBS, MD (Pharmacology)",
      experience: "10+ years leadership experience",
      location: "Bangalore, India",
      highlights: ["Professor of Pharmacology", "ICMR Research PI", "Multiple Publications"],
      summary: "Senior medical affairs professional with over 10 years of leadership experience as a Professor of Pharmacology, bringing deep expertise in drug evaluation, clinical evidence interpretation, and medical strategy. Widely experienced in research leadership, scientific education, and evidence-based medical communication, with strong readiness for non-clinical senior leadership roles including Regional Medical Director or Medical Affairs Director.",
      competencies: [
        "Leadership in medical strategy development and scientific governance",
        "Expert in evidence-based medicine, clinical data interpretation, and benefit–risk assessment",
        "Oversight of scientific communication, medical education, and compliant engagement",
        "Strong understanding of drug development, pharmacology, and lifecycle management",
        "Cross-functional collaboration with clinical development, PV, regulatory, and commercial teams"
      ],
      researchLeadership: [
        "Author of multiple peer-reviewed national and international publications",
        "Principal Investigator / Co-Investigator on several ICMR-funded research projects",
        "Research design and protocol development",
        "Data analysis and interpretation",
        "Scientific writing and publication oversight"
      ],
      education_training: [
        "Over 10 years of teaching experience for MBBS and postgraduate (MD) students",
        "Regular faculty for Continuing Medical Education (CME) programs and professional training",
        "Experienced research guide and mentor for undergraduate and postgraduate students",
        "Strong capability in stakeholder education, KOL engagement, and scientific exchange"
      ],
      idealFit: [
        "Regional Medical Director",
        "Medical Affairs Director",
        "Senior Medical Advisor / Medical Lead",
        "Medical Strategy & Scientific Affairs Head",
        "Medical Governance / Medical Excellence Leadership"
      ]
    },
    {
      id: 9,
      name: "Dr. Neha Deshmukh",
      age: 42,
      category: "SENIOR MEDICAL AFFAIRS LEADERSHIP",
      role: "Senior Medical Education & Scientific Affairs Leader",
      avatar: "ND",
      avatarColor: "from-violet-500 to-purple-500",
      education: "MBBS, MD (Human Anatomy)",
      experience: "14 years progressive experience",
      location: "Pune, India",
      highlights: ["Professor of Anatomy", "CME/CPD Faculty", "Academic Leadership"],
      summary: "Senior medical professional with 14 years of progressive experience as a Professor of Human Anatomy, combining deep expertise in medical education, research leadership, and scientific communication. Widely experienced in teaching across medical and paramedical disciplines, leading academic and research initiatives, and delivering Continuing Medical Education (CME) and Continuing Professional Development (CPD) programs.",
      competencies: [
        "Medical education strategy and curriculum development",
        "Scientific and anatomical expertise supporting medical and clinical research",
        "Evidence-based medicine and research methodology",
        "Medical and scientific communication (written and oral)",
        "Academic leadership and stakeholder engagement"
      ],
      researchLeadership: [
        "Extensive involvement in research design, execution, and publication",
        "Author/co-author of multiple peer-reviewed research publications",
        "Experience guiding and mentoring undergraduate and postgraduate research projects",
        "Strong capability in data interpretation, scientific writing, and evidence synthesis"
      ],
      education_training: [
        "14 years of teaching experience across MBBS, postgraduate, and paramedical programs",
        "Regular faculty and speaker for CME, CPD, workshops, and academic conferences",
        "Proven ability to translate complex anatomical and scientific concepts into clear, practical learning",
        "Strong engagement with healthcare professionals, educators, and academic leaders"
      ],
      idealFit: [
        "Medical Education Director / Head of Medical Education",
        "Scientific Affairs Lead / Director",
        "Medical Affairs (Non-Clinical / Education-Focused)",
        "Research Strategy & Academic Partnerships Lead",
        "Medical Training & Professional Development Head"
      ]
    },
    {
      id: 10,
      name: "Dr. Amit Kulkarni",
      age: 35,
      category: "SENIOR MEDICAL AFFAIRS LEADERSHIP",
      role: "Senior Medical & Scientific Affairs Professional",
      avatar: "AK",
      avatarColor: "from-orange-500 to-red-500",
      education: "MBBS (Grant Medical College, Mumbai), MD (Pharmacology & Therapeutics)",
      experience: "Cross-domain leadership experience",
      location: "Mumbai, India",
      highlights: ["University Second Rank", "Research Publications", "Thought Leader"],
      summary: "A seasoned medical doctor and pharmacologist with solid clinical grounding, academic excellence, and cross-domain leadership experience across medical strategy, pharmacology research, scientific communication, and education. Brings a strong research orientation, demonstrated thought leadership in pharmacology, and experience in both industry and academic roles.",
      competencies: [
        "Expertise in interpreting clinical and pharmacological evidence for strategic decision-making",
        "Ability to translate complex scientific concepts into actionable medical and educational insights",
        "Extensive track record including peer-reviewed research publications and high-visibility academic output",
        "Capable of designing research frameworks, supervising research teams, and mentoring students",
        "Experience delivering lectures and sessions for undergraduate and postgraduate learners",
        "Skilled in developing scientific content for CME/CPD and professional audiences"
      ],
      communication: [
        "Strong written and verbal communication skills, demonstrated in academic and professional forums",
        "Active engagement as a public educator on medical career pathways and healthcare innovation",
        "Strong communicator adept at engaging with KOLs, regulatory stakeholders, and academic institutions"
      ],
      idealFit: [
        "Regional Medical Director",
        "Head of Medical Affairs / Scientific Affairs",
        "Director – Medical Strategy & Communications",
        "Medical Education & Research Lead",
        "Senior Medical Advisor / Thought Leader"
      ]
    },
    {
      id: 11,
      name: "Dr. Priyanka Singh",
      age: 36,
      category: "SENIOR MEDICAL AFFAIRS LEADERSHIP",
      role: "Senior Medical Safety & Scientific Affairs Professional",
      avatar: "PS",
      avatarColor: "from-green-500 to-teal-500",
      education: "MBBS, MD (Pharmacology)",
      experience: "Extensive safety & PV experience",
      location: "Gurgaon, India",
      highlights: ["Drug Safety Physician", "Medical Reviewer", "PV Expert"],
      summary: "A seasoned Drug Safety Physician and Medical Reviewer with expertise in pharmacovigilance, clinical safety monitoring, and medical evaluation. The candidate brings strong clinical pharmacology knowledge and extensive experience in reviewing safety data, medical case evaluation, and pharmacovigilance decision support. Demonstrates capability to drive medical safety insights and support cross-functional teams in regulated environments.",
      competencies: [
        "Expert in medical review and assessment of adverse events and safety case data",
        "Experienced in medical monitoring through clinical and post-marketing safety data streams",
        "Ability to interpret complex clinical findings and make medically sound safety recommendations",
        "Depth of knowledge in pharmacovigilance processes, safety reporting standards, and risk evaluation",
        "Proficient in medical writing for safety documentation, narratives, and regulatory submissions"
      ],
      communication: [
        "Strong written and verbal communication skills for internal and external scientific discussions",
        "Skilled in presenting safety insights and recommendations to clinical, regulatory, and cross-functional stakeholders",
        "Valuable experience as a Medical Advisor, providing clinical insight and expert evaluation",
        "Ability to support medical strategy, safety governance, and lifecycle safety planning"
      ],
      idealFit: [
        "Senior Medical Monitor",
        "Medical Reviewer – Lead / Manager",
        "Medical Safety Manager / Physician – Pharmacovigilance",
        "Medical Affairs Lead – Safety and Scientific Oversight",
        "Clinical Safety Strategist / Medical Advisor"
      ]
    }
  ];

  const toggleExpand = (profileId) => {
    setExpandedProfiles(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;
    
    const query = searchQuery.toLowerCase();
    return profiles.filter(profile => 
      profile.name.toLowerCase().includes(query) ||
      profile.role.toLowerCase().includes(query) ||
      profile.category.toLowerCase().includes(query) ||
      profile.education.toLowerCase().includes(query) ||
      profile.location.toLowerCase().includes(query) ||
      profile.highlights.some(h => h.toLowerCase().includes(query))
    );
  }, [searchQuery, profiles]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Premium Student Profiles | Jobslly Healthcare Talent</title>
        <meta name="description" content="Browse exceptional healthcare talent profiles. Clinical Research Associates, Pharmacovigilance Specialists, Medical Affairs professionals ready for recruitment." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-6 h-6 text-teal-600" />
              Contact Recruiter
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Get in touch with our recruitment team for detailed candidate information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Phone */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
              <div className="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Phone Number</p>
                <a 
                  href="tel:8265903855" 
                  className="text-lg font-bold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  8265903855
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border border-emerald-200">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Email Address</p>
                <a 
                  href="mailto:upskill@academically.com" 
                  className="text-lg font-bold text-emerald-600 hover:text-emerald-700 transition-colors break-all"
                >
                  upskill@academically.com
                </a>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => window.location.href = 'tel:8265903855'}
                className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button
                onClick={() => window.location.href = 'mailto:upskill@academically.com'}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-emerald-50 pt-32 pb-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-full border border-teal-200 mb-6">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Premium Healthcare Talent</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Exceptional Student
              <span className="block bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Profiles
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Discover highly qualified healthcare professionals ready to join your organization.
              <br className="hidden sm:block" />
              Clinical Research • Pharmacovigilance • Medical Affairs • HEOR
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by name, role, specialization, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-6 text-base bg-white border-2 border-teal-200 text-gray-900 placeholder:text-gray-500 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-md"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-3">
                  Found {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profiles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-gray-50 to-teal-50">
        {filteredProfiles.length === 0 ? (
          <Card className="bg-white border-2 border-gray-200 p-12 text-center shadow-lg">
            <div className="text-gray-600">
              <Search className="w-16 h-16 mx-auto mb-4 text-teal-400" />
              <p className="text-lg font-semibold">No profiles found matching "{searchQuery}"</p>
              <p className="text-sm mt-2">Try different keywords or clear your search</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredProfiles.map((profile, index) => (
              <Card 
                key={profile.id}
                className={`group bg-white border-2 border-teal-100 hover:border-teal-400 hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                  index % 2 === 0 ? 'lg:mr-12' : 'lg:ml-12'
                }`}
              >
                <CardContent className="p-0">
                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    {/* Avatar Side */}
                    <div className={`lg:w-1/3 p-8 lg:p-12 bg-gradient-to-br ${profile.avatarColor} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black rounded-full blur-3xl"></div>
                      </div>
                      
                      <div className="relative text-center">
                        <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/30">
                          <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {profile.avatar}
                          </span>
                        </div>
                        
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs px-3 py-1">
                          Profile #{profile.id}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="lg:w-2/3 p-6 lg:p-10">
                      {/* Header */}
                      <div className="mb-6">
                        <Badge className="mb-3 bg-teal-100 text-teal-700 border-teal-300 text-xs">
                          {profile.category}
                        </Badge>
                        
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                          {profile.name}
                        </h2>
                        
                        <p className="text-base lg:text-lg text-gray-700 mb-4">
                          {profile.role}
                        </p>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <GraduationCap className="w-4 h-4 text-teal-600" />
                            <span className="text-sm">{profile.education}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm">{profile.experience} experience</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm">{profile.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Award className="w-4 h-4 text-teal-600" />
                            <span className="text-sm">{profile.age} years old</span>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-2">
                          {profile.highlights.map((highlight, idx) => (
                            <Badge 
                              key={idx}
                              className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-6">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {profile.summary}
                        </p>
                      </div>

                      {/* Expandable Details */}
                      {expandedProfiles[profile.id] && (
                        <div className="space-y-6 mb-6 animate-in slide-in-from-top duration-300">
                          {/* Core Competencies */}
                          {profile.competencies && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-teal-600" />
                                Core Competencies
                              </h3>
                              <ul className="space-y-2">
                                {profile.competencies.map((comp, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                                    <span>{comp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Clinical Readiness */}
                          {profile.clinicalReadiness && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                Clinical Development Readiness
                              </h3>
                              <ul className="space-y-2">
                                {profile.clinicalReadiness.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* PV Readiness */}
                          {profile.pvReadiness && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-cyan-600" />
                                Pharmacovigilance Role Readiness
                              </h3>
                              <ul className="space-y-2">
                                {profile.pvReadiness.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></div>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Systems & Tools */}
                          {profile.systems && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-teal-600" />
                                Systems & Tools
                              </h3>
                              <ul className="space-y-2">
                                {profile.systems.map((sys, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                                    <span>{sys}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Publications */}
                          {profile.publications && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                Publications & Scientific Output
                              </h3>
                              <ul className="space-y-2">
                                {profile.publications.map((pub, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                                    <span>{pub}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Capabilities */}
                          {profile.capabilities && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-cyan-600" />
                                Medical Affairs Capabilities
                              </h3>
                              <ul className="space-y-2">
                                {profile.capabilities.map((cap, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></div>
                                    <span>{cap}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* MSL Skills */}
                          {profile.mslSkills && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Award className="w-5 h-5 text-teal-600" />
                                MSL Skills & Communication
                              </h3>
                              <ul className="space-y-2">
                                {profile.mslSkills.map((skill, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0"></div>
                                    <span>{skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Engagement */}
                          {profile.engagement && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-emerald-600" />
                                Stakeholder Engagement
                              </h3>
                              <ul className="space-y-2">
                                {profile.engagement.map((eng, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                                    <span>{eng}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Ideal Fit */}
                          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border-2 border-teal-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-teal-600" />
                              Ideal Role Fit
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {profile.idealFit.map((role, idx) => (
                                <Badge 
                                  key={idx}
                                  className="bg-teal-100 text-teal-700 border-teal-300"
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => toggleExpand(profile.id)}
                          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white"
                        >
                          {expandedProfiles[profile.id] ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              View Full Profile
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-50"
                          onClick={() => setIsContactModalOpen(true)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Contact Recruiter
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build Your Team?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Contact our recruitment specialists to discuss these exceptional candidates
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-teal-700 hover:bg-gray-100 shadow-xl"
              onClick={() => setIsContactModalOpen(true)}
            >
              <Phone className="w-5 h-5 mr-2" />
              Schedule a Call
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/20"
              onClick={() => window.location.href = '/contact-us'}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfiles;
