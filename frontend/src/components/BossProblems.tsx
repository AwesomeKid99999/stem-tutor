import React, { useState, useEffect } from 'react';
import { Skull, Crown, Zap, Trophy, Target, Clock, Star, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BossProblem {
  id: string;
  name: string;
  subject: 'math' | 'physics' | 'chemistry' | 'biology' | 'coding' | 'engineering';
  difficulty: 'apprentice' | 'expert' | 'master' | 'legendary';
  description: string;
  longDescription: string;
  phases: BossPhase[];
  xpReward: number;
  unlocked: boolean;
  completed: boolean;
  currentPhase: number;
  totalTime: number; // minutes
  rewards: BossReward[];
  prerequisite?: string;
}

interface BossPhase {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  timeEstimate: number;
  questions: BossQuestion[];
}

interface BossQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer' | 'calculation';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface BossReward {
  type: 'badge' | 'avatar' | 'title' | 'cosmetic';
  name: string;
  description: string;
  rarity: 'rare' | 'epic' | 'legendary';
}

const defaultBossProblems: BossProblem[] = [
  {
    id: 'chemistry-titan',
    name: 'The Molecular Titan',
    subject: 'chemistry',
    difficulty: 'expert',
    description: 'A colossal being made of atoms and molecules. Master chemical bonding to break its structure!',
    longDescription: 'Deep within the atomic realm stands the Molecular Titan, a massive entity composed of countless chemical bonds. Its body shifts between ionic crystals, covalent networks, and metallic structures. Only by understanding the fundamental forces that hold matter together can you dismantle this chemical colossus.',
    phases: [
      { 
        id: '1', 
        name: 'Atomic Foundation', 
        description: 'Understand the Titan\'s atomic structure', 
        completed: false, 
        timeEstimate: 20,
        questions: [
          {
            id: 'q1',
            question: 'The Molecular Titan\'s core contains an atom with 17 protons and 18 neutrons. What element is this?',
            type: 'multiple-choice',
            options: ['Sulfur', 'Chlorine', 'Argon', 'Potassium'],
            correctAnswer: 'Chlorine',
            explanation: 'An atom with 17 protons is chlorine (Cl). The number of protons determines the element identity.',
            points: 100
          },
          {
            id: 'q2',
            question: 'What is the electron configuration of this chlorine atom?',
            type: 'multiple-choice',
            options: ['1s² 2s² 2p⁶ 3s² 3p⁵', '1s² 2s² 2p⁶ 3s² 3p⁶', '1s² 2s² 2p⁶ 3s¹', '1s² 2s² 2p⁵'],
            correctAnswer: '1s² 2s² 2p⁶ 3s² 3p⁵',
            explanation: 'Chlorine has 17 electrons. Following the aufbau principle: 1s² 2s² 2p⁶ 3s² 3p⁵',
            points: 150
          },
          {
            id: 'q3',
            question: 'The Titan\'s armor shows periodic trends. Which element has the largest atomic radius?',
            type: 'multiple-choice',
            options: ['Fluorine', 'Chlorine', 'Bromine', 'Iodine'],
            correctAnswer: 'Iodine',
            explanation: 'Atomic radius increases down a group. Iodine is lowest in Group 17, so it has the largest radius.',
            points: 100
          }
        ]
      },
      { 
        id: '2', 
        name: 'Ionic Assault', 
        description: 'Break the Titan\'s ionic bonds', 
        completed: false, 
        timeEstimate: 25,
        questions: [
          {
            id: 'q4',
            question: 'The Titan\'s left arm is made of sodium chloride. What type of bonding holds it together?',
            type: 'multiple-choice',
            options: ['Covalent bonding', 'Metallic bonding', 'Ionic bonding', 'Hydrogen bonding'],
            correctAnswer: 'Ionic bonding',
            explanation: 'NaCl forms through electron transfer from Na to Cl, creating Na⁺ and Cl⁻ ions held by electrostatic forces.',
            points: 100
          },
          {
            id: 'q5',
            question: 'What is the formula for the compound formed between aluminum (Al³⁺) and sulfur (S²⁻)?',
            type: 'short-answer',
            correctAnswer: 'Al₂S₃',
            explanation: 'To balance charges: 2 Al³⁺ ions (+6 charge) and 3 S²⁻ ions (-6 charge) = Al₂S₃',
            points: 150
          },
          {
            id: 'q6',
            question: 'The Titan\'s ionic shield has high melting point and conducts electricity when molten. Why?',
            type: 'multiple-choice',
            options: [
              'Weak intermolecular forces',
              'Strong electrostatic forces between ions',
              'Delocalized electrons',
              'Hydrogen bonding'
            ],
            correctAnswer: 'Strong electrostatic forces between ions',
            explanation: 'Ionic compounds have strong electrostatic attractions requiring high energy to break, and mobile ions when molten allow electrical conduction.',
            points: 200
          }
        ]
      },
      { 
        id: '3', 
        name: 'Covalent Strike', 
        description: 'Disrupt the Titan\'s covalent networks', 
        completed: false, 
        timeEstimate: 30,
        questions: [
          {
            id: 'q7',
            question: 'The Titan\'s heart is a diamond structure. What type of bonding creates this hardness?',
            type: 'multiple-choice',
            options: ['Ionic bonding', 'Metallic bonding', 'Covalent network bonding', 'Van der Waals forces'],
            correctAnswer: 'Covalent network bonding',
            explanation: 'Diamond\'s hardness comes from a 3D network of strong covalent bonds between carbon atoms.',
            points: 100
          },
          {
            id: 'q8',
            question: 'What is the molecular geometry of water (H₂O) in the Titan\'s blood?',
            type: 'multiple-choice',
            options: ['Linear', 'Trigonal planar', 'Tetrahedral', 'Bent'],
            correctAnswer: 'Bent',
            explanation: 'H₂O has 4 electron pairs around oxygen (2 bonding, 2 lone pairs), giving bent geometry with ~104.5° angle.',
            points: 150
          },
          {
            id: 'q9',
            question: 'The Titan uses hydrogen bonding for self-repair. Which molecule can form hydrogen bonds?',
            type: 'multiple-choice',
            options: ['CH₄', 'NH₃', 'CO₂', 'CCl₄'],
            correctAnswer: 'NH₃',
            explanation: 'NH₃ can form hydrogen bonds because H is bonded to N (highly electronegative), and N has lone pairs.',
            points: 200
          }
        ]
      },
      { 
        id: '4', 
        name: 'Final Reaction', 
        description: 'Trigger the ultimate chemical reaction', 
        completed: false, 
        timeEstimate: 15,
        questions: [
          {
            id: 'q10',
            question: 'Balance this equation to defeat the Titan: Al + CuSO₄ → Al₂(SO₄)₃ + Cu',
            type: 'short-answer',
            correctAnswer: '2Al + 3CuSO₄ → Al₂(SO₄)₃ + 3Cu',
            explanation: 'Balance Al first (2), then Cu (3), then verify SO₄ groups (3 on each side).',
            points: 200
          },
          {
            id: 'q11',
            question: 'The final blow requires 32.0 g of oxygen to react with methane. How many moles of O₂ is this?',
            type: 'calculation',
            correctAnswer: '1.00',
            explanation: 'Moles = mass ÷ molar mass = 32.0 g ÷ 32.0 g/mol = 1.00 mol O₂',
            points: 250
          }
        ]
      }
    ],
    xpReward: 1000,
    unlocked: true,
    completed: false,
    currentPhase: 0,
    totalTime: 90,
    rewards: [
      { type: 'badge', name: 'Molecular Master', description: 'Defeated the Molecular Titan', rarity: 'epic' },
      { type: 'avatar', name: 'Chemical Warrior', description: 'Unlocks avatar with molecular armor', rarity: 'epic' },
      { type: 'title', name: 'Bond Breaker', description: 'Display title: "The Bond Breaker"', rarity: 'rare' }
    ]
  },
  {
    id: 'islamic-guardian',
    name: 'The Guardian of Knowledge',
    subject: 'religion',
    difficulty: 'apprentice',
    description: 'An ancient guardian tests your understanding of Islamic wisdom and history.',
    longDescription: 'In the halls of the House of Wisdom stands an ancient Guardian, keeper of Islamic knowledge through the ages. This ethereal being has witnessed the rise of Islamic civilization, the Golden Age of science, and the spread of Islamic teachings across the world. To pass its trial, you must demonstrate deep understanding of Islamic foundations, history, and contemporary relevance.',
    phases: [
      { 
        id: '1', 
        name: 'Pillars of Faith', 
        description: 'Demonstrate knowledge of Islamic foundations', 
        completed: false, 
        timeEstimate: 20,
        questions: [
          {
            id: 'q1',
            question: 'What does "Tawhid" mean in Islamic theology?',
            type: 'multiple-choice',
            options: [
              'The Five Pillars of Islam',
              'The oneness and uniqueness of Allah',
              'The pilgrimage to Mecca',
              'The holy month of fasting'
            ],
            correctAnswer: 'The oneness and uniqueness of Allah',
            explanation: 'Tawhid is the fundamental concept of Islamic monotheism, asserting Allah\'s absolute oneness and uniqueness.',
            points: 100
          },
          {
            id: 'q2',
            question: 'List the Five Pillars of Islam in order.',
            type: 'short-answer',
            correctAnswer: 'Shahada, Salah, Zakat, Sawm, Hajj',
            explanation: '1. Shahada (Declaration of Faith), 2. Salah (Prayer), 3. Zakat (Charity), 4. Sawm (Fasting), 5. Hajj (Pilgrimage)',
            points: 150
          },
          {
            id: 'q3',
            question: 'What is the significance of the Hijra in Islamic history?',
            type: 'multiple-choice',
            options: [
              'The first revelation to Prophet Muhammad',
              'The conquest of Mecca',
              'The migration from Mecca to Medina in 622 CE',
              'The compilation of the Quran'
            ],
            correctAnswer: 'The migration from Mecca to Medina in 622 CE',
            explanation: 'The Hijra marks the beginning of the Islamic calendar and the establishment of the first Muslim community.',
            points: 100
          }
        ]
      },
      { 
        id: '2', 
        name: 'Golden Age Wisdom', 
        description: 'Explore the Islamic Golden Age achievements', 
        completed: false, 
        timeEstimate: 25,
        questions: [
          {
            id: 'q4',
            question: 'Which Abbasid caliph is most associated with the Islamic Golden Age?',
            type: 'multiple-choice',
            options: ['Abu Bakr', 'Umar ibn al-Khattab', 'Harun al-Rashid', 'Ali ibn Abi Talib'],
            correctAnswer: 'Harun al-Rashid',
            explanation: 'Harun al-Rashid (786-809 CE) ruled during the peak of the Islamic Golden Age, with Baghdad as the center of learning.',
            points: 100
          },
          {
            id: 'q5',
            question: 'Name the Islamic scholar known as the "Father of Algebra".',
            type: 'short-answer',
            correctAnswer: 'Al-Khwarizmi',
            explanation: 'Muhammad ibn Musa al-Khwarizmi (780-850 CE) developed algebraic methods and introduced Hindu-Arabic numerals to the West.',
            points: 150
          },
          {
            id: 'q6',
            question: 'What was the House of Wisdom in Baghdad?',
            type: 'multiple-choice',
            options: [
              'A mosque for prayer',
              'A center of learning and translation',
              'The caliph\'s palace',
              'A military academy'
            ],
            correctAnswer: 'A center of learning and translation',
            explanation: 'The House of Wisdom was a major intellectual center where scholars translated and preserved Greek, Persian, and Indian texts.',
            points: 200
          }
        ]
      },
      { 
        id: '3', 
        name: 'Contemporary Understanding', 
        description: 'Show knowledge of modern Islamic diversity', 
        completed: false, 
        timeEstimate: 20,
        questions: [
          {
            id: 'q7',
            question: 'Which region has the largest Muslim population in the world?',
            type: 'multiple-choice',
            options: [
              'Middle East and North Africa',
              'South and Southeast Asia',
              'Sub-Saharan Africa',
              'Europe and Americas'
            ],
            correctAnswer: 'South and Southeast Asia',
            explanation: 'Countries like Indonesia, Pakistan, India, and Bangladesh have the largest Muslim populations globally.',
            points: 100
          },
          {
            id: 'q8',
            question: 'What is the Islamic principle of environmental stewardship called?',
            type: 'short-answer',
            correctAnswer: 'Khalifa',
            explanation: 'Khalifa means humans are trustees or stewards of Earth, responsible for its care and protection.',
            points: 150
          },
          {
            id: 'q9',
            question: 'Islamic finance avoids which practice that is prohibited in Islam?',
            type: 'multiple-choice',
            options: ['Trade', 'Investment', 'Interest (Riba)', 'Partnership'],
            correctAnswer: 'Interest (Riba)',
            explanation: 'Islamic finance prohibits interest (riba) and instead uses profit-sharing and asset-backed financing.',
            points: 200
          }
        ]
      }
    ],
    xpReward: 750,
    unlocked: true,
    completed: false,
    currentPhase: 0,
    totalTime: 65,
    rewards: [
      { type: 'badge', name: 'Guardian\'s Blessing', description: 'Earned the Guardian\'s approval', rarity: 'epic' },
      { type: 'avatar', name: 'Scholar of Wisdom', description: 'Unlocks scholarly robes avatar', rarity: 'rare' },
      { type: 'title', name: 'Keeper of Knowledge', description: 'Display title: "Keeper of Knowledge"', rarity: 'rare' }
    ]
  },
  {
    id: 'quantum-dragon',
    name: 'Quantum Mechanics Dragon',
    subject: 'physics',
    difficulty: 'master',
    description: 'This dragon exists in multiple states simultaneously. Use quantum physics to collapse its wave function!',
    longDescription: 'Deep in the quantum realm lurks a dragon that defies classical physics. It phases between dimensions, tunnels through barriers, and exhibits wave-particle duality. Only a true master of quantum mechanics can predict its behavior and emerge victorious.',
    phases: [
      { 
        id: '1', 
        name: 'Wave Function Analysis', 
        description: 'Calculate probability distributions', 
        completed: false, 
        timeEstimate: 25,
        questions: [
          {
            id: 'q1',
            question: 'What does the square of the wave function |ψ|² represent?',
            type: 'multiple-choice',
            options: ['Energy', 'Momentum', 'Probability density', 'Wavelength'],
            correctAnswer: 'Probability density',
            explanation: 'The Born interpretation states that |ψ|² gives the probability density of finding a particle at a given location.',
            points: 150
          }
        ]
      },
      { 
        id: '2', 
        name: 'Quantum Tunneling', 
        description: 'Solve barrier penetration problems', 
        completed: false, 
        timeEstimate: 20,
        questions: [
          {
            id: 'q2',
            question: 'Quantum tunneling allows particles to pass through barriers even when they have insufficient energy. True or False?',
            type: 'multiple-choice',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'Quantum tunneling is a quantum mechanical phenomenon where particles can pass through energy barriers classically forbidden.',
            points: 100
          }
        ]
      },
      { 
        id: '3', 
        name: 'Uncertainty Principle', 
        description: 'Apply Heisenberg\'s principle', 
        completed: false, 
        timeEstimate: 15,
        questions: [
          {
            id: 'q3',
            question: 'Heisenberg\'s uncertainty principle states that you cannot simultaneously know both position and what other property with perfect precision?',
            type: 'short-answer',
            correctAnswer: 'momentum',
            explanation: 'The uncertainty principle: Δx × Δp ≥ ℏ/2, where you cannot precisely know both position and momentum simultaneously.',
            points: 200
          }
        ]
      },
      { 
        id: '4', 
        name: 'Final Collapse', 
        description: 'Measure the quantum state', 
        completed: false, 
        timeEstimate: 10,
        questions: [
          {
            id: 'q4',
            question: 'What happens to a quantum system when it is measured?',
            type: 'multiple-choice',
            options: [
              'Nothing changes',
              'The wave function collapses to a definite state',
              'The system gains energy',
              'The system becomes classical'
            ],
            correctAnswer: 'The wave function collapses to a definite state',
            explanation: 'Quantum measurement causes wave function collapse, forcing the system into one of its possible eigenstates.',
            points: 250
          }
        ]
      }
    ],
    xpReward: 1200,
    unlocked: false,
    completed: false,
    currentPhase: 0,
    totalTime: 70,
    prerequisite: 'Complete 5 physics topics',
    rewards: [
      { type: 'badge', name: 'Quantum Slayer', description: 'Mastered quantum mechanics', rarity: 'legendary' },
      { type: 'cosmetic', name: 'Quantum Aura', description: 'Glowing particle effect around avatar', rarity: 'epic' },
      { type: 'title', name: 'Wave Whisperer', description: 'Display title: "The Wave Whisperer"', rarity: 'epic' }
    ]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'apprentice': return 'from-blue-500 to-cyan-500';
    case 'expert': return 'from-purple-500 to-pink-500';
    case 'master': return 'from-orange-500 to-red-500';
    case 'legendary': return 'from-yellow-400 to-orange-500';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case 'apprentice': return <Target className="h-5 w-5" />;
    case 'expert': return <Skull className="h-5 w-5" />;
    case 'master': return <Crown className="h-5 w-5" />;
    case 'legendary': return <Trophy className="h-5 w-5" />;
    default: return <Target className="h-5 w-5" />;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'rare': return 'text-blue-500';
    case 'epic': return 'text-purple-500';
    case 'legendary': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
};

export const BossProblems: React.FC = () => {
  const [bossProblems, setBossProblems] = useState<BossProblem[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<BossProblem | null>(null);
  const [showBossDetail, setShowBossDetail] = useState(false);
  const [inBattle, setInBattle] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [phaseScore, setPhaseScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load boss challenges from backend
  useEffect(() => {
    const fetchBossChallenges = async () => {
      console.log('🔍 Fetching boss challenges...');
      try {
        const response = await fetch('http://localhost:3001/api/boss-challenges');
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (response.ok) {
          const challenges = await response.json();
          console.log('✅ Fetched challenges:', challenges);
          console.log('📊 Number of challenges:', challenges.length);
          setBossProblems(challenges);
        } else {
          console.error('❌ Failed to fetch boss challenges:', response.status);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
          // Fallback to hardcoded data
          console.log('🔄 Falling back to hardcoded data');
          setBossProblems(defaultBossProblems);
        }
      } catch (error) {
        console.error('💥 Error fetching boss challenges:', error);
        // Fallback to hardcoded data
        console.log('🔄 Falling back to hardcoded data');
        setBossProblems(defaultBossProblems);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
      }
    };

    fetchBossChallenges();
  }, []);

  const startBossChallenge = (boss: BossProblem) => {
    if (!boss.unlocked) return;
    
    setSelectedBoss(boss);
    setShowBossDetail(true);
  };

  const startBattle = () => {
    setInBattle(true);
    setCurrentPhaseIndex(0);
    setCurrentQuestionIndex(0);
    setTotalScore(0);
    setPhaseScore(0);
    setShowBossDetail(false);
  };

  const submitAnswer = () => {
    if (!selectedBoss || !inBattle) return;
    
    const currentPhase = selectedBoss.phases[currentPhaseIndex];
    const currentQuestion = currentPhase.questions[currentQuestionIndex];
    
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setPhaseScore(prev => prev + currentQuestion.points);
      setTotalScore(prev => prev + currentQuestion.points);
    }
  };

  const nextQuestion = () => {
    if (!selectedBoss || !inBattle) return;
    
    const currentPhase = selectedBoss.phases[currentPhaseIndex];
    
    if (currentQuestionIndex < currentPhase.questions.length - 1) {
      // Next question in same phase
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
    } else {
      // Phase completed, move to next phase or finish
      if (currentPhaseIndex < selectedBoss.phases.length - 1) {
        setCurrentPhaseIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        setPhaseScore(0);
        setUserAnswer('');
        setShowResult(false);
      } else {
        // Boss defeated!
        setInBattle(false);
        setShowBossDetail(true);
        // Mark boss as completed (in real app, save to backend)
        console.log(`Boss ${selectedBoss.id} defeated with score: ${totalScore}`);
      }
    }
  };

  const exitBattle = () => {
    setInBattle(false);
    setShowBossDetail(false);
    setSelectedBoss(null);
    setUserAnswer('');
    setShowResult(false);
    setCurrentPhaseIndex(0);
    setCurrentQuestionIndex(0);
    setPhaseScore(0);
    setTotalScore(0);
  };

  // Battle Interface
  if (inBattle && selectedBoss) {
    const currentPhase = selectedBoss.phases[currentPhaseIndex];
    const currentQuestion = currentPhase.questions[currentQuestionIndex];
    const phaseProgress = ((currentQuestionIndex + 1) / currentPhase.questions.length) * 100;
    const overallProgress = ((currentPhaseIndex * 100 + phaseProgress) / selectedBoss.phases.length);

    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Battle Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${getDifficultyColor(selectedBoss.difficulty)}`}>
              {getDifficultyIcon(selectedBoss.difficulty)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{selectedBoss.name}</h1>
              <p className="text-muted-foreground">Phase {currentPhaseIndex + 1}: {currentPhase.name}</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
          
          {/* Score */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Phase Score: {phaseScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span>Total Score: {totalScore}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Question {currentQuestionIndex + 1} of {currentPhase.questions.length}
                </CardTitle>
                <Badge variant="outline" className="mt-2">
                  {currentQuestion.points} points
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={exitBattle}>
                Exit Battle
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-lg font-medium leading-relaxed">
              {currentQuestion.question}
            </div>
            
            {/* Answer Input */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options ? (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={userAnswer === option ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => setUserAnswer(option)}
                    disabled={showResult}
                  >
                    <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={showResult}
                  onKeyDown={(e) => e.key === 'Enter' && !showResult && submitAnswer()}
                />
              </div>
            )}
            
            {/* Result */}
            {showResult && (
              <Card className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Target className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                    {isCorrect && (
                      <Badge className="bg-green-100 text-green-800">
                        +{currentQuestion.points} points
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm font-medium text-gray-800 mt-2">
                      Correct answer: {currentQuestion.correctAnswer}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={exitBattle}>
                Retreat
              </Button>
              
              {showResult ? (
                <Button onClick={nextQuestion} className="btn-cosmic">
                  {currentQuestionIndex < currentPhase.questions.length - 1 
                    ? 'Next Question' 
                    : currentPhaseIndex < selectedBoss.phases.length - 1 
                    ? 'Next Phase' 
                    : 'Claim Victory!'
                  }
                </Button>
              ) : (
                <Button 
                  onClick={submitAnswer} 
                  disabled={!userAnswer.trim()}
                  className="btn-cosmic"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Loading Boss Challenges...</h3>
          <p className="text-muted-foreground">Preparing epic battles for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          Boss Challenge Arena
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Face legendary STEM challenges that test your mastery. These epic multi-phase battles 
          reward exclusive badges, avatars, and cosmic powers!
        </p>
      </div>

      {/* Boss Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bossProblems.map((boss) => {
          const completedPhases = boss.phases.filter(p => p.completed).length;
          const totalPhases = boss.phases.length;
          const progressPercent = (completedPhases / totalPhases) * 100;

          return (
            <Card 
              key={boss.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                boss.completed 
                  ? 'ring-2 ring-green-500 shadow-lg' 
                  : boss.unlocked 
                  ? 'ring-2 ring-primary shadow-lg hover:shadow-xl' 
                  : 'opacity-60 grayscale cursor-not-allowed'
              }`}
              onClick={() => boss.unlocked && startBossChallenge(boss)}
            >
              {/* Background gradient based on difficulty */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(boss.difficulty)} opacity-10`}
              />
              
              {/* Boss completion glow effect */}
              {boss.completed && (
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-500/20 animate-pulse" />
              )}
              
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <Badge 
                    className={`bg-gradient-to-r ${getDifficultyColor(boss.difficulty)} text-white capitalize`}
                  >
                    {getDifficultyIcon(boss.difficulty)}
                    <span className="ml-1">{boss.difficulty}</span>
                  </Badge>
                  
                  {boss.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : boss.unlocked ? (
                    <Star className="h-6 w-6 text-primary" />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {boss.name}
                </CardTitle>
                
                <Badge variant="outline" className="w-fit capitalize">
                  {boss.subject}
                </Badge>
              </CardHeader>
              
              <CardContent className="relative space-y-4">
                <CardDescription className="text-sm">
                  {boss.description}
                </CardDescription>
                
                {/* Progress if started */}
                {completedPhases > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{completedPhases}/{totalPhases} phases</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{boss.totalTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{boss.xpReward} XP</span>
                  </div>
                </div>
                
                {/* Rewards preview */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">REWARDS:</div>
                  <div className="flex flex-wrap gap-1">
                    {boss.rewards.slice(0, 3).map((reward, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={`text-xs ${getRarityColor(reward.rarity)}`}
                      >
                        {reward.name}
                      </Badge>
                    ))}
                    {boss.rewards.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{boss.rewards.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Unlock requirement */}
                {!boss.unlocked && boss.prerequisite && (
                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                    🔒 {boss.prerequisite}
                  </div>
                )}
                
                {/* Action button */}
                <Button 
                  className="w-full mt-4" 
                  variant={boss.completed ? "outline" : "default"}
                  disabled={!boss.unlocked}
                >
                  {boss.completed 
                    ? 'Completed' 
                    : boss.unlocked 
                    ? completedPhases > 0 
                      ? 'Continue Challenge' 
                      : 'Begin Challenge'
                    : 'Locked'
                  }
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Boss Detail Modal */}
      {showBossDetail && selectedBoss && (
        <Dialog open={showBossDetail} onOpenChange={setShowBossDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getDifficultyColor(selectedBoss.difficulty)}`}>
                  {getDifficultyIcon(selectedBoss.difficulty)}
                </div>
                {selectedBoss.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Boss Story */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm leading-relaxed">{selectedBoss.longDescription}</p>
              </div>
              
              {/* Battle Phases */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Battle Phases</h3>
                <div className="space-y-3">
                  {selectedBoss.phases.map((phase, index) => (
                    <Card key={phase.id} className={phase.completed ? 'bg-green-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Phase {index + 1}: {phase.name}</h4>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="text-sm text-muted-foreground">~{phase.timeEstimate} min</div>
                            {phase.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  const phaseIndex = selectedBoss.phases.findIndex(p => p.id === phase.id);
                                  setCurrentPhaseIndex(phaseIndex);
                                  setCurrentQuestionIndex(0);
                                  startBattle();
                                }}
                              >
                                Start Phase
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Rewards */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Epic Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedBoss.rewards.map((reward, index) => (
                    <Card key={index} className="bg-gradient-to-br from-background to-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getRarityColor(reward.rarity)} bg-current/10`}>
                            {reward.type === 'badge' && <Trophy className="h-5 w-5" />}
                            {reward.type === 'avatar' && <Crown className="h-5 w-5" />}
                            {reward.type === 'title' && <Star className="h-5 w-5" />}
                            {reward.type === 'cosmetic' && <Zap className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{reward.name}</h4>
                            <p className="text-xs text-muted-foreground">{reward.description}</p>
                            <Badge variant="outline" className={`text-xs mt-1 ${getRarityColor(reward.rarity)}`}>
                              {reward.rarity}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowBossDetail(false)}>
                  Back to Arena
                </Button>
                <Button onClick={startBattle} className="btn-cosmic">
                  <Target className="h-4 w-4 mr-2" />
                  Enter Battle
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};