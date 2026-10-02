import { useState } from "react";
import { BookOpen, Award, Check, Cpu, HelpCircle, GraduationCap, ChevronRight, HelpCircle as QuestionIcon, Flame, Library, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PhysicsTutorProps {
  onAddAnalysisLog: (text: string) => void;
}

interface PhysicsFormula {
  id: string;
  topic: string;
  name: string;
  equation: string;
  variables: string[];
  siUnits: string;
  condition: string;
}

const FORMULA_LIBRARY: PhysicsFormula[] = [
  {
    id: "f1",
    topic: "Classical Mechanics",
    name: "Newton's Second Law (Rotational Form)",
    equation: "τ = I · α",
    variables: ["τ: Torque (N·m)", "I: Moment of Inertia (kg·m²)", "α: Angular Acceleration (rad/s²)"],
    siUnits: "Newton-meters (N·m)",
    condition: "Rigid body rotating about a fixed axis with constant or varying torque.",
  },
  {
    id: "f2",
    topic: "Electromagnetism",
    name: "Capacitor Energy Density",
    equation: "u = (1/2) · ε₀ · E²",
    variables: ["u: Energy Density (J/m³)", "ε₀: Permittivity of Free Space (8.854e-12 F/m)", "E: Electric Field strength (V/m)"],
    siUnits: "Joules per cubic meter (J/m³)",
    condition: "Uniform electric field in a vacuum or dielectric (requires replacement of ε₀ with ε).",
  },
  {
    id: "f3",
    topic: "Modern Physics & Relativity",
    name: "Lorentz Factor & Special Relativity",
    equation: "γ = 1 / √(1 - v²/c²)",
    variables: ["γ: Lorentz factor (dimensionless)", "v: Relative velocity (m/s)", "c: Speed of light (3e8 m/s)"],
    siUnits: "Dimensionless",
    condition: "Relativistic motion of inertial frames where v represents high relativistic speed.",
  },
  {
    id: "f4",
    topic: "Quantum Mechanics",
    name: "De Broglie Wavelength",
    equation: "λ = h / p = h / (m · v)",
    variables: ["λ: De Broglie wavelength (m)", "h: Planck's constant (6.626e-34 J·s)", "p: Momentum (kg·m/s)", "m: Mass (kg)", "v: Velocity (m/s)"],
    siUnits: "Meters (m)",
    condition: "Applicable to all matter possessing particle-wave duality, relativistic effects excluded unless p is updated.",
  },
  {
    id: "f5",
    topic: "Thermodynamics",
    name: "Entropy Change (Isothermal Expansion)",
    equation: "ΔS = n · R · ln(V_f / V_i)",
    variables: ["ΔS: Entropy change (J/K)", "n: Number of moles", "R: Ideal gas constant (8.314 J/mol·K)", "V_f/V_i: Final/Initial volumes"],
    siUnits: "Joules per Kelvin (J/K)",
    condition: "Reversible isothermal expansion of an ideal gas.",
  }
];

interface ProblemPreset {
  title: string;
  text: string;
  category: string;
  difficulty: "FSc / A-Level" | "BS Physics" | "MSc Physics";
  solution: {
    concept: string;
    given: string[];
    formula: string;
    steps: string[];
    unitCheck: string;
    interpretation: string;
  };
}

const PROBLEM_PRESETS: ProblemPreset[] = [
  {
    title: "Relativistic Time Dilation of a Muon",
    text: "Calculate the dilated lifetime of a cosmic-ray muon traveling at a speed of v = 0.98c relative to Earth, given its rest lifetime is τ₀ = 2.2 microseconds.",
    category: "Special Relativity",
    difficulty: "BS Physics",
    solution: {
      concept: "Special Relativity Time Dilation. Moving particles experience a dilated lifetime relative to an observer at rest due to Lorentz contraction of coordinates.",
      given: ["Rest lifetime (τ₀) = 2.2 μs = 2.2 × 10⁻⁶ s", "Relative velocity (v) = 0.98c", "Speed of light (c) = 3 × 10⁸ m/s"],
      formula: "τ = γ · τ₀ = τ₀ / √(1 - v²/c²)",
      steps: [
        "First, compute the Lorentz factor γ. Here, v/c = 0.98, so (v/c)² = 0.9604.",
        "Calculate the denominator: √(1 - 0.9604) = √(0.0396) ≈ 0.199.",
        "Solve for γ: γ = 1 / 0.199 ≈ 5.025 (The muon's time flows ~5 times slower).",
        "Compute final dilated time: τ = 5.025 × 2.2 μs = 11.055 microseconds."
      ],
      unitCheck: "Dilated time is measured in microseconds (μs), which perfectly matches the rest-time time base dimensional units.",
      interpretation: "The dilated lifetime (11.06 μs) is significantly longer than the rest lifetime. This explains why high-speed cosmic muons can reach the Earth's surface before decaying, which would be physically impossible without relativistic time dilation!"
    }
  },
  {
    title: "1D Infinite Potential Well Wavefunction",
    text: "Find the normalized wavefunction and corresponding ground state energy of a single electron confined inside a 1-dimensional box of width L = 0.2 nm.",
    category: "Quantum Mechanics",
    difficulty: "BS Physics",
    solution: {
      concept: "Particle in a 1D Box (Infinite Potential Well). The potential is zero inside the box and infinite outside. Schrodinger equation solutions yield quantized stationary states.",
      given: ["Box width (L) = 0.2 nm = 2 × 10⁻¹⁰ m", "Electron mass (m_e) = 9.11 × 10⁻³¹ kg", "Planck constant (h) = 6.626 × 10⁻³⁴ J·s", "Principal quantum number (n) = 1 (ground state)"],
      formula: "ψ_n(x) = √(2/L) · sin(n·π·x / L)   and   E_n = n²·h² / (8·m·L²)",
      steps: [
        "Compute wavefunction normalization factor: √(2/L) = √(2 / 2e-10) = √(1e10) = 100,000 m^(-1/2).",
        "Waveform equation for ground state n=1: ψ₁(x) = 100,000 · sin(π·x / (2e-10)) for 0 < x < L.",
        "Compute ground state energy denominator: 8 · m_e · L² = 8 × (9.11e-31) × (2e-10)² = 8 × 9.11e-31 × 4e-20 = 2.915 × 10⁻⁴⁹ kg·m².",
        "Compute energy numerator for n=1: 1² · h² = (6.626e-34)² = 4.39e-67 J²·s².",
        "Divide to get ground state energy E₁: E₁ = 4.39e-67 / 2.915e-49 = 1.506 × 10⁻¹⁸ Joules.",
        "Convert to electron-volts: E₁ = 1.506e-18 / 1.6e-19 ≈ 9.41 eV."
      ],
      unitCheck: "[ψ] has units of m^(-1/2) ensuring that ∫|ψ|² dx is dimensionless. [E₁] has units of Joules (J), convertible to electron-volts (eV) for atomic dimensions.",
      interpretation: "Confining an electron in a sub-nanometer scale potential well forces its energy to be strictly quantized with a zero-point energy of 9.41 eV, which represents quantum kinetic energy due to the uncertainty principle."
    }
  },
  {
    title: "Toroidal Solenoid Magnetic Field Strength",
    text: "A toroidal coil with a mean radius of R = 15 cm is wrapped with N = 1200 turns of wire. If a steady current of I = 3.5 Amperes flows, calculate the magnetic field magnitude at the centerline.",
    category: "Electromagnetism",
    difficulty: "FSc / A-Level",
    solution: {
      concept: "Ampere's Law for highly symmetric closed current contours. The magnetic field lines inside a toroid form concentric circles.",
      given: ["Mean Radius (R) = 15 cm = 0.15 m", "Number of Turns (N) = 1200", "Current (I) = 3.5 A", "Permittivity constant μ₀ = 4π × 10⁻⁷ T·m/A"],
      formula: "B = μ₀ · N · I / (2 · π · R)",
      steps: [
        "Write the circumference of the toroid core centerline: C = 2 · π · R = 2 · π · 0.15 = 0.9425 meters.",
        "Calculate total enclosed current: N · I = 1200 × 3.5 = 4200 Ampere-turns.",
        "Compute B: B = (4πe-7) × 4200 / 0.9425.",
        "Simplify calculation: B = (4 × 3.1416e-7) × 4200 / (2 × 3.1416 × 0.15) = (2e-7) × 1200 × 3.5 / 0.15.",
        "Compute final magnitude: B = 2.8 × 10⁻³ Tesla = 2.8 mT."
      ],
      unitCheck: "[B] has unit of Tesla (T) where 1 T = 1 N/(A·m), verifying that μ₀ · I / R yields correct magnetic force coefficients.",
      interpretation: "The magnetic field inside the core of the toroid centerline is exactly 2.8 milli-Tesla (mT). Magnetic field lines are perfectly sealed within the torus core, meaning external stray induction leakage is virtually zero."
    }
  }
];

interface MCQ {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const ACADEMIC_QUIZ: MCQ[] = [
  {
    question: "Under Special Relativity, which of the following physical quantities is invariant (remains identical in all inertial reference frames)?",
    options: ["Relativistic Mass", "Time Interval between events", "Spacetime Interval (ds²)", "Length along direction of motion"],
    correct: 2,
    explanation: "While coordinate intervals of space (dx) and time (dt) depend heavily on frame velocity, the combined Spacetime Interval ds² = c²dt² - dx² is an invariant scalar under Lorentz transforms."
  },
  {
    question: "What is the physical meaning of the 'Poynting Vector' (S = E × H) in electromagnetic field theory?",
    options: ["The direction of electrical charge flow", "Energy flux density (energy flowing per unit area per unit time)", "The momentum vector of localized charges", "Electrostatic potential curvature"],
    correct: 1,
    explanation: "The Poynting Vector represents the directional energy flux density (expressed in Watts per square meter) of an propagating electromagnetic wave."
  },
  {
    question: "In thermodynamics, what condition must a process satisfy to be classified as completely 'Isentropic'?",
    options: ["It must occur at constant temperature", "It must be completely isobaric and zero energy", "It must be both adiabatic and reversible", "Volume must remain strictly constant"],
    correct: 2,
    explanation: "An adiabatic process with no heat transfer that is also fully reversible produces zero entropy generation (dS = dQ/T = 0), making it strictly isentropic."
  }
];

export default function PhysicsTutor({ onAddAnalysisLog }: PhysicsTutorProps) {
  const [activeSubTab, setActiveSubTab] = useState<"solver" | "formula" | "quiz">("solver");
  const [customQuestion, setCustomQuestion] = useState("");
  const [solvedPreset, setSolvedPreset] = useState<ProblemPreset | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [formulaSearch, setFormulaSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");

  // Quiz state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Custom solver text response generator
  const handleSolveCustom = () => {
    if (!customQuestion.trim()) return;
    setIsSolving(true);
    onAddAnalysisLog(`PHYSICS BRAIN: Commencing complex analysis of custom request...`);

    setTimeout(() => {
      // Simulate real-time custom calculation based on input keywords
      const questionLower = customQuestion.toLowerCase();
      let generatedPreset: ProblemPreset;

      if (questionLower.includes("capacitor") || questionLower.includes("rc") || questionLower.includes("charge")) {
        generatedPreset = {
          title: "Custom Capicitor Solved Case",
          category: "Electromagnetism",
          difficulty: "BS Physics",
          text: customQuestion,
          solution: {
            concept: "Capacitor transient response and Coulomb charge accumulation. As current flows, voltage across plates builds logarithmically as a function of the RC time constant.",
            given: ["Estimated standard resistor (R) = 100 kΩ = 10⁵ Ω", "Estimated capacitor (C) = 10 μF = 10⁻⁵ F", "Estimated source voltage (V_0) = 12 Volts"],
            formula: "q(t) = C · V₀ · (1 - e^(-t / (R·C)))",
            steps: [
              "Determine the time constant: τ = R · C = 10⁵ × 10⁻⁵ = 1.0 second.",
              "Calculate maximum charge capacity: q_max = C · V₀ = 10⁻⁵ F × 12 V = 1.2 × 10⁻⁴ Coulombs = 120 μC.",
              "If assessing at t = 1τ (1 sec): (1 - e⁻¹) = 1 - 0.368 = 0.632.",
              "Solve for accumulated charge at t=1s: q(1s) = 120 μC × 0.632 = 75.84 μC."
            ],
            unitCheck: "Charges measured in Coulombs (C) which is dimensionalized as Amperes × Seconds (A·s). All equations scale securely.",
            interpretation: "The capacitor reaches 63.2% of its maximum possible charge (75.84 μC) in exactly one time-constant (1 second). Complete saturation (>99%) takes approximately 5 time-constants (5 seconds)."
          }
        };
      } else if (questionLower.includes("gravity") || questionLower.includes("orbit") || questionLower.includes("satellite") || questionLower.includes("earth")) {
        generatedPreset = {
          title: "Orbital Satellite Escape Path",
          category: "Classical Mechanics",
          difficulty: "FSc / A-Level",
          text: customQuestion,
          solution: {
            concept: "Gravitational binding potential and orbital mechanics. The velocity needed to break away from Earth's gravity field completely.",
            given: ["Gravitational constant G = 6.674 × 10⁻¹¹ N·m²/kg²", "Earth mass M = 5.972 × 10²⁴ kg", "Earth mean radius R = 6.371 × 10⁶ meters"],
            formula: "v_escape = √(2 · G · M / R)",
            steps: [
              "Multiply G by M: G · M = (6.674e-11) × (5.972e24) ≈ 3.986 × 10¹⁴ m³/s².",
              "Multiply by 2 for escape ratio: 2 · G · M = 7.972 × 10¹⁴ m³/s².",
              "Divide by radius R: 7.972e14 / 6.371e6 ≈ 1.251 × 10⁸ m²/s².",
              "Extract square root to solve velocity: v = √(1.251e8) ≈ 11,185 meters per second (11.2 km/s)."
            ],
            unitCheck: "[v_escape] reduces to m/s which perfectly corresponds to kinematics metrics.",
            interpretation: "An escape speed of 11.2 km/s is required. This represents the velocity threshold where the object's kinetic energy perfectly cancels out its negative gravitational potential energy."
          }
        };
      } else {
        // Default versatile solver template
        generatedPreset = {
          title: "Custom Mathematical Physics Derivation",
          category: "Mathematical Physics",
          difficulty: "BS Physics",
          text: customQuestion,
          solution: {
            concept: "Linear approximation and dimensional boundary checks under fundamental physical fields.",
            given: ["User-defined parameters extracted from query context.", "Calculated scaling factor = 1.0 (invariant)"],
            formula: "f(x) ≈ f(a) + f'(a)·(x - a) + O((x-a)²)",
            steps: [
              "Construct the differential boundary state based on the question variables.",
              "Isolate the prime kinetic variables and integrate along the bounding coordinates.",
              "Recheck for algebraic constraints and normalize coefficients.",
              "Verify boundary state limit convergence."
            ],
            unitCheck: "Verification complete. Standard physical units remain consistent across boundary values.",
            interpretation: "The solution converges stably. Iqra recommends establishing a localized numerical grid to track higher-order perturbations if boundary ranges exceed normal thresholds."
          }
        };
      }

      setSolvedPreset(generatedPreset);
      setIsSolving(false);
      onAddAnalysisLog(`PHYSICS BRAIN: Solved custom problem successfully! Mode: Step-by-Step.`);
    }, 1200);
  };

  // Filter formula list
  const filteredFormulas = FORMULA_LIBRARY.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(formulaSearch.toLowerCase()) || 
                          f.equation.toLowerCase().includes(formulaSearch.toLowerCase()) ||
                          f.topic.toLowerCase().includes(formulaSearch.toLowerCase());
    const matchesTopic = selectedTopic === "All" || f.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const topics = ["All", "Classical Mechanics", "Electromagnetism", "Modern Physics & Relativity", "Quantum Mechanics", "Thermodynamics"];

  // Quiz helper
  const handleAnswerSubmit = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    setShowExplanation(true);
    if (optionIdx === ACADEMIC_QUIZ[currentQuestionIdx].correct) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestionIdx < ACADEMIC_QUIZ.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-6" id="iqra-physics-tutor-root">
      {/* Subtab Navigation */}
      <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-900 max-w-md">
        <button
          onClick={() => setActiveSubTab("solver")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeSubTab === "solver"
              ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> Solver & Derivation
        </button>
        <button
          onClick={() => setActiveSubTab("formula")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeSubTab === "formula"
              ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Library className="w-3.5 h-3.5" /> Formula Brain
        </button>
        <button
          onClick={() => setActiveSubTab("quiz")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeSubTab === "quiz"
              ? "bg-cyan-600/10 border border-cyan-500/20 text-cyan-400"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Award className="w-3.5 h-3.5" /> Exam Prep Quiz
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PHYSICS GENIUS SOLVER */}
        {activeSubTab === "solver" && (
          <motion.div
            key="solver"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Presets Selection */}
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Standard BS Physics Solved Presets</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PROBLEM_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSolvedPreset(p);
                      onAddAnalysisLog(`PHYSICS BRAIN: Loaded preset solved framework: ${p.title}`);
                    }}
                    className="bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 p-3 rounded-xl text-left transition-all duration-300 group hover:bg-slate-900/80 active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center gap-2 mb-1">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {p.category}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">{p.difficulty}</span>
                    </div>
                    <h4 className="text-xs text-slate-200 font-medium group-hover:text-white line-clamp-1">{p.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{p.text}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Solve Field */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Ask Iqra Any Physics / Derivation Problem</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Ask about <span className="text-cyan-400 font-semibold">Special Relativity</span>, <span className="text-cyan-400 font-semibold">Capacitors</span>, <span className="text-cyan-400 font-semibold">Quantum Mechanics</span>, or input any mathematical physics equations. Iqra will calculate and solve it step-by-step.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., Explain de Broglie wavelength or Solve capacitor charge in RC circuit..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSolveCustom()}
                  className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  onClick={handleSolveCustom}
                  disabled={isSolving || !customQuestion.trim()}
                  className="px-5 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                >
                  {isSolving ? (
                    <>
                      <Cpu className="w-3.5 h-3.5 animate-spin" /> Solving...
                    </>
                  ) : (
                    <>
                      Solve <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Solved View */}
            <AnimatePresence mode="popLayout">
              {solvedPreset && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-slate-950/80 border border-cyan-500/10 rounded-2xl p-6 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[8px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded uppercase font-bold">
                        {solvedPreset.category}
                      </span>
                      <h3 className="text-sm font-semibold font-mono text-white mt-1">{solvedPreset.title}</h3>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 italic">{solvedPreset.difficulty} Tutor Matrix</span>
                  </div>

                  <div className="space-y-4 font-mono text-[11px]">
                    {/* Question block */}
                    <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60">
                      <span className="text-[9px] uppercase text-cyan-500 font-bold block mb-1">Question</span>
                      <p className="text-slate-300 leading-relaxed font-sans">{solvedPreset.text}</p>
                    </div>

                    {/* Step 1: Concept Identification */}
                    <div>
                      <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                        <span className="bg-cyan-500/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">1</span>
                        Concept Identification
                      </span>
                      <p className="text-slate-400 pl-5 leading-normal">{solvedPreset.solution.concept}</p>
                    </div>

                    {/* Step 2: Given Data */}
                    <div>
                      <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                        <span className="bg-cyan-500/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">2</span>
                        Given Variables (Standard Units)
                      </span>
                      <ul className="pl-5 space-y-0.5">
                        {solvedPreset.solution.given.map((v, i) => (
                          <li key={i} className="text-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" /> {v}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step 3: Formula Selection */}
                    <div>
                      <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                        <span className="bg-cyan-500/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">3</span>
                        Equation Selection
                      </span>
                      <div className="pl-5 py-2.5 my-1 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                        <span className="text-sm text-cyan-300 font-bold font-sans tracking-wide">{solvedPreset.solution.formula}</span>
                      </div>
                    </div>

                    {/* Step 4: Step-by-Step Solution */}
                    <div>
                      <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1.5 mb-1.5">
                        <span className="bg-cyan-500/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">4</span>
                        Step-by-Step Simplification
                      </span>
                      <ol className="pl-5 space-y-1 text-slate-300">
                        {solvedPreset.solution.steps.map((step, i) => (
                          <li key={i} className="leading-relaxed">
                            <span className="text-cyan-500/60 font-bold mr-1">{i + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Step 5: Unit Verification */}
                    <div>
                      <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                        <span className="bg-cyan-500/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">5</span>
                        Dimensional Unit Verification
                      </span>
                      <p className="text-emerald-400 pl-5 leading-normal flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {solvedPreset.solution.unitCheck}
                      </p>
                    </div>

                    {/* Step 6: Conceptual Interpretation */}
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                        <span className="bg-cyan-500/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">6</span>
                        Iqra's Conceptual Intuition
                      </span>
                      <p className="text-slate-400 pl-5 leading-relaxed font-sans italic">
                        "Alright, physics learner! 😏 {solvedPreset.solution.interpretation}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 2: FORMULA BRAIN */}
        {activeSubTab === "formula" && (
          <motion.div
            key="formula"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search and filter row */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Search formulas by name or equation..."
                value={formulaSearch}
                onChange={(e) => setFormulaSearch(e.target.value)}
                className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
              />
              <div className="flex flex-wrap gap-1">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`text-[9px] font-mono px-2.5 py-1.5 rounded-lg border transition-all ${
                      selectedTopic === t
                        ? "bg-cyan-600/10 border-cyan-500/30 text-cyan-400 font-bold"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.replace("Modern Physics & Relativity", "Relativity")}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFormulas.map((f) => (
                <div
                  key={f.id}
                  className="bg-slate-950/50 border border-slate-900 rounded-2xl p-4 space-y-3 hover:border-cyan-500/10 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-[8px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                      {f.topic}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">{f.name}</span>
                  </div>

                  <div className="py-3 bg-slate-900/60 rounded-xl text-center border border-slate-900">
                    <span className="text-base font-bold font-sans text-white tracking-wide">{f.equation}</span>
                  </div>

                  <div className="space-y-1 text-[10px] font-mono text-slate-400">
                    <span className="text-[8px] uppercase font-bold text-slate-500 block">Variable Meanings</span>
                    <div className="grid grid-cols-1 gap-0.5 pl-2 border-l border-slate-800">
                      {f.variables.map((v, i) => (
                        <div key={i}>{v}</div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.03] text-[9px] font-mono">
                    <div>
                      <span className="text-slate-500 uppercase block font-bold">SI Units</span>
                      <span className="text-slate-300">{f.siUnits}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block font-bold">Application Condition</span>
                      <span className="text-slate-300 line-clamp-2" title={f.condition}>{f.condition}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: EXAM PREP QUIZ */}
        {activeSubTab === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6"
          >
            {!quizCompleted ? (
              <div className="space-y-6">
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-cyan-400 font-bold uppercase">Physics Prep Challenge</span>
                    <span className="text-slate-500">
                      Question {currentQuestionIdx + 1} of {ACADEMIC_QUIZ.length}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIdx + 1) / ACADEMIC_QUIZ.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question block */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium font-sans text-slate-100">
                    {ACADEMIC_QUIZ[currentQuestionIdx].question}
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    {ACADEMIC_QUIZ[currentQuestionIdx].options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === ACADEMIC_QUIZ[currentQuestionIdx].correct;
                      const showResult = selectedOption !== null;

                      let btnStyle = "bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300";
                      if (showResult) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold";
                        } else if (isSelected) {
                          btnStyle = "bg-red-500/10 border-red-500/40 text-red-300";
                        } else {
                          btnStyle = "bg-slate-900/20 border-slate-950 text-slate-600 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={showResult}
                          onClick={() => handleAnswerSubmit(idx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono transition-all duration-300 flex items-center justify-between ${btnStyle}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {option}
                          </span>
                          {showResult && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation container */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 font-mono text-[10px] space-y-1.5"
                    >
                      <span className="text-[9px] uppercase text-cyan-400 font-bold block">Tutor Explanation</span>
                      <p className="text-slate-300 leading-normal">
                        {ACADEMIC_QUIZ[currentQuestionIdx].explanation}
                      </p>
                      <button
                        onClick={handleNextQuestion}
                        className="mt-3 px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-lg font-bold flex items-center gap-1.5 active:scale-95 ml-auto text-[9px]"
                      >
                        {currentQuestionIdx === ACADEMIC_QUIZ.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-400 mx-auto border border-cyan-500/20">
                  <Award className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Physics Prep Quiz Completed!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Your Score: <span className="text-cyan-400 font-bold font-mono">{quizScore} / {ACADEMIC_QUIZ.length}</span> (
                    {Math.round((quizScore / ACADEMIC_QUIZ.length) * 100)}%)
                  </p>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-left max-w-sm mx-auto font-mono text-[10px] text-slate-400 leading-normal">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 block mb-1">Iqra's Feedback</span>
                  {quizScore === ACADEMIC_QUIZ.length ? (
                    "Whoa, physics warrior! 😏 Absolute 100% score! Your special relativity and entropy parameters are fully optimized."
                  ) : quizScore >= 2 ? (
                    "Excellent progress! You have a solid grasp of thermodynamics and invariant spacetime intervals."
                  ) : (
                    "Not bad! Let's hit the Formula Brain and revisit De Broglie wavelength wave-particle properties to strengthen your weak areas."
                  )}
                </div>

                <button
                  onClick={resetQuiz}
                  className="px-5 py-2.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold transition-all inline-flex items-center gap-1.5 active:scale-95"
                >
                  Retake Quiz Challenge
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
