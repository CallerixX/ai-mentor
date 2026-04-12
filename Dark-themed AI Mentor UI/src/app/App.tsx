import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CodeRunnerPanel } from './components/CodeRunnerPanel';
import { SnippetsPanel } from './components/SnippetsPanel';
import { SolutionCheckerPanel } from './components/SolutionCheckerPanel';
import { StatsModal } from './components/StatsModal';
import { SkillPickerModal } from './components/SkillPickerModal';
import { AchievementToast } from './components/AchievementToast';
import { Code2, Database, Zap, Coffee, Settings, Wrench, Box, FileCode, Blocks, Server, Container, GitBranch, Terminal, BarChart3, Brain, Plug, Cloud, Shield, TestTube, Network } from 'lucide-react';

export type Skill = {
  id: string;
  name: string;
  Icon: any;
  description: string;
};

export type Mode = 'learning' | 'debug' | 'review' | 'practice';

export type Session = {
  id: string;
  name: string;
  messages: Message[];
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
};

export type CodeBlock = {
  language: string;
  code: string;
};

export type Theme = 'dark' | 'light' | 'amoled';
export type DesignStyle = 'glass' | 'brutalist';

const SKILLS: Skill[] = [
  { id: 'python', name: 'Python', Icon: Code2, description: 'Основы Python программирования' },
  { id: 'sql', name: 'SQL', Icon: Database, description: 'Работа с базами данных' },
  { id: 'js', name: 'JavaScript', Icon: Zap, description: 'Веб-разработка на JavaScript' },
  { id: 'java', name: 'Java', Icon: Coffee, description: 'Объектно-ориентированное программирование' },
  { id: 'cpp', name: 'C++', Icon: Settings, description: 'Системное программирование' },
  { id: 'rust', name: 'Rust', Icon: Wrench, description: 'Безопасное программирование' },
  { id: 'go', name: 'Go', Icon: Box, description: 'Современный системный язык' },
  { id: 'ts', name: 'TypeScript', Icon: FileCode, description: 'Типизированный JavaScript' },
  { id: 'react', name: 'React', Icon: Blocks, description: 'Создание UI компонентов' },
  { id: 'node', name: 'Node.js', Icon: Server, description: 'Серверный JavaScript' },
  { id: 'docker', name: 'Docker', Icon: Container, description: 'Контейнеризация приложений' },
  { id: 'git', name: 'Git', Icon: GitBranch, description: 'Контроль версий' },
  { id: 'linux', name: 'Linux', Icon: Terminal, description: 'Работа с командной строкой' },
  { id: 'pandas', name: 'Pandas', Icon: BarChart3, description: 'Анализ данных на Python' },
  { id: 'ml', name: 'ML', Icon: Brain, description: 'Машинное обучение' },
  { id: 'api', name: 'API', Icon: Plug, description: 'Разработка REST API' },
  { id: 'cloud', name: 'Cloud', Icon: Cloud, description: 'Облачные технологии' },
  { id: 'security', name: 'Security', Icon: Shield, description: 'Безопасность приложений' },
  { id: 'testing', name: 'Testing', Icon: TestTube, description: 'Тестирование кода' },
  { id: 'algorithms', name: 'Algorithms', Icon: Network, description: 'Алгоритмы и структуры данных' },
];

export default function App() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [currentMode, setCurrentMode] = useState<Mode>('learning');
  const [sessions, setSessions] = useState<Session[]>([
    { id: '1', name: 'Новая сессия', messages: [] }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [activePanel, setActivePanel] = useState<'python' | 'sql' | 'snippets' | 'solution' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(true);
  const [showAchievement, setShowAchievement] = useState(false);
  const [level, setLevel] = useState({ number: 1, name: 'Новичок', xp: 150, maxXp: 500 });
  const [theme, setTheme] = useState<Theme>('dark');
  const [designStyle, setDesignStyle] = useState<DesignStyle>('glass');

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill);
    setShowSkillPicker(false);
  };

  const handleSendMessage = (content: string) => {
    if (!currentSession) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setSessions(prev => prev.map(s =>
      s.id === currentSessionId
        ? { ...s, messages: [...s.messages, newMessage] }
        : s
    ));

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Отличный вопрос! Давайте разберём это подробнее...',
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(s =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, aiMessage] }
          : s
      ));
    }, 1000);
  };

  const getBackgroundStyle = () => {
    if (designStyle === 'brutalist') {
      if (theme === 'light') {
        return { background: '#ffffff', color: '#000000' };
      } else if (theme === 'amoled') {
        return { background: '#000000', color: '#ffffff' };
      }
      return { background: '#1a1a1a', color: '#ffffff' };
    }

    // Glass style
    if (theme === 'light') {
      return {
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 50%, #dce8ff 100%)',
        color: '#1a1a2e',
      };
    } else if (theme === 'amoled') {
      return {
        background: '#000000',
        color: '#e0e0f0',
      };
    }

    return {
      background: 'linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%)',
      color: 'var(--text-primary)',
    };
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex"
      style={getBackgroundStyle()}
    >
      <Sidebar
        selectedSkill={selectedSkill}
        currentMode={currentMode}
        sessions={sessions}
        currentSessionId={currentSessionId}
        level={level}
        theme={theme}
        designStyle={designStyle}
        onSkillSelect={setSelectedSkill}
        onModeChange={setCurrentMode}
        onSessionChange={setCurrentSessionId}
        onNewSession={() => {
          const newSession: Session = {
            id: Date.now().toString(),
            name: 'Новая сессия',
            messages: []
          };
          setSessions(prev => [...prev, newSession]);
          setCurrentSessionId(newSession.id);
        }}
        onDeleteSession={(id) => {
          setSessions(prev => prev.filter(s => s.id !== id));
          if (currentSessionId === id) {
            setCurrentSessionId(sessions[0]?.id || '');
          }
        }}
        onOpenPanel={setActivePanel}
        onShowStats={() => setShowStats(true)}
        onThemeChange={setTheme}
        onDesignStyleChange={setDesignStyle}
        skills={SKILLS}
      />

      <ChatArea
        selectedSkill={selectedSkill}
        currentMode={currentMode}
        currentSession={currentSession}
        theme={theme}
        designStyle={designStyle}
        onSendMessage={handleSendMessage}
      />

      {activePanel === 'python' && (
        <CodeRunnerPanel
          type="python"
          theme={theme}
          designStyle={designStyle}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'sql' && (
        <CodeRunnerPanel
          type="sql"
          theme={theme}
          designStyle={designStyle}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'snippets' && (
        <SnippetsPanel
          theme={theme}
          designStyle={designStyle}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'solution' && (
        <SolutionCheckerPanel
          theme={theme}
          designStyle={designStyle}
          onClose={() => setActivePanel(null)}
        />
      )}

      {showStats && (
        <StatsModal
          level={level}
          skills={SKILLS.slice(0, 8)}
          theme={theme}
          designStyle={designStyle}
          onClose={() => setShowStats(false)}
        />
      )}

      {showSkillPicker && (
        <SkillPickerModal
          skills={SKILLS}
          theme={theme}
          designStyle={designStyle}
          onSelect={handleSkillSelect}
        />
      )}

      {showAchievement && (
        <AchievementToast
          achievement={{
            icon: '🏆',
            name: 'Первый шаг',
            description: 'Отправлено первое сообщение ментору'
          }}
          onClose={() => setShowAchievement(false)}
        />
      )}
    </div>
  );
}
