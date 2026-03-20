import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Fade,
  Grow,
  Stack,
  useTheme,
  alpha,
  Skeleton,
  Tooltip,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  Send,
  Lightbulb,
  SmartToy,
  Person,
  TrendingUp,
  EmojiObjects,
  Refresh,
  DarkMode,
  LightMode,
  Download,
  AddPhotoAlternate,
  Close,
  RocketLaunch,
  AutoGraph,
  Work,
  Description,
  PictureAsPdf,
  InsertDriveFile,
  AttachFile,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { validateIdea } from '../services/api';
import { ColorModeContext } from '../App';

const float = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -50px) rotate(5deg); }
  66% { transform: translate(-20px, 20px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const FloatingShape = styled(motion.div)(({ theme, color }) => ({
  position: 'absolute',
  width: 150,
  height: 150,
  borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
  background: `linear-gradient(45deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
  filter: 'blur(40px)',
  zIndex: 0,
  pointerEvents: 'none',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  height: 'calc(100vh - 100px)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 32,
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'light' 
    ? '0 30px 90px rgba(0,0,0,0.12)' 
    : '0 30px 90px rgba(0,0,0,0.6)',
  background: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.85)' 
    : alpha(theme.palette.background.paper, 0.75),
  backdropFilter: 'blur(30px)',
  border: theme.palette.mode === 'light' 
    ? '1px solid rgba(255, 255, 255, 0.4)'
    : `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    height: '100vh',
    borderRadius: 0,
    border: 'none',
  },
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  position: 'relative',
  zIndex: 1,
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.text.primary, 0.1),
    borderRadius: 10,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
}));

const MessageBubble = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexDirection: isUser ? 'row-reverse' : 'row',
  alignItems: 'flex-start',
  maxWidth: '88%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '95%',
    gap: theme.spacing(1),
  },
}));

const MessageContent = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  padding: theme.spacing(2.5, 3),
  borderRadius: isUser ? '24px 8px 24px 24px' : '8px 24px 24px 24px',
  backgroundColor: isUser 
    ? theme.palette.primary.main 
    : (theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.9)),
  color: isUser ? '#fff' : theme.palette.text.primary,
  boxShadow: isUser 
    ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.35)}`
    : (theme.palette.mode === 'light' ? '0 12px 40px rgba(0,0,0,0.06)' : '0 12px 40px rgba(0,0,0,0.4)'),
  border: isUser ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  '&:hover': {
    transform: isUser ? 'scale(1.01) translateX(-4px)' : 'scale(1.01) translateX(4px)',
  },
  
  // ── Markdown Styling (Premium SaaS Level) ──────────────────────────────────
  '& p': { margin: '0 0 12px 0', lineHeight: 1.7, fontSize: '1rem', fontWeight: 500 },
  '& p:last-child': { margin: 0 },
  '& h3': { 
    marginTop: 20, 
    marginBottom: 12, 
    fontSize: '1.25rem', 
    fontWeight: 900, 
    letterSpacing: -0.5,
    color: isUser ? '#fff' : theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },
  '& ul, & ol': { 
    paddingLeft: 20, 
    margin: '12px 0',
    '& li': { 
      marginBottom: 8,
      lineHeight: 1.6,
      '& strong': { color: isUser ? '#fff' : theme.palette.secondary.main }
    }
  },
  '& code': {
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    padding: '2px 6px',
    borderRadius: 6,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.9em',
    color: isUser ? '#fff' : theme.palette.secondary.main,
  },
  '& pre': {
    backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fc',
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    overflowX: 'auto',
    '& code': { backgroundColor: 'transparent', padding: 0 }
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.secondary.main}`,
    margin: '16px 0',
    padding: '8px 20px',
    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
    fontStyle: 'italic',
    borderRadius: '0 12px 12px 0'
  }
}));

const AttachmentCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})(({ theme, isUser }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  gap: theme.spacing(1.5),
  background: isUser ? alpha('#fff', 0.1) : alpha(theme.palette.divider, 0.05),
  border: `1px solid ${isUser ? alpha('#fff', 0.2) : alpha(theme.palette.divider, 0.1)}`,
  color: isUser ? '#fff' : theme.palette.text.primary,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    background: isUser ? alpha('#fff', 0.15) : alpha(theme.palette.divider, 0.08),
  }
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  maxWidth: '100%',
  '& img': {
    width: '100%',
    maxHeight: 280,
    objectFit: 'cover',
    display: 'block',
    borderRadius: 12,
  },
}));

const FileIcon = ({ type, sx }) => {
  if (type.startsWith('image/')) return <AddPhotoAlternate sx={sx} />;
  if (type.includes('pdf')) return <PictureAsPdf sx={sx} />;
  if (type.includes('word') || type.includes('officedocument')) return <Description sx={sx} />;
  return <InsertDriveFile sx={sx} />;
};

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 5),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 2),
    height: 60,
  },
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 5, 4, 5),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backgroundColor: alpha(theme.palette.background.paper, 0.4),
  zIndex: 10,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2, 2, 2),
  },
}));

const FilePreviewArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(2),
  marginLeft: theme.spacing(1),
}));

const TypingIndicator = () => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={0.6} alignItems="center" sx={{ py: 1.2, px: 0.5 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
          style={{
            width: 7,
            height: 7,
            backgroundColor: theme.palette.secondary.main,
            borderRadius: '50%',
          }}
        />
      ))}
    </Stack>
  );
};

const exampleIdeas = [
  "🚀 Is my AI-powered nutrition SaaS idea actually useful for real users?",
  "🌱 How can I build eco-friendly packaging that D2C brands will love and pay for?",
  "💡 What is the biggest problem my target users face and how can I solve it?"
];

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          data: reader.result,
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (textToSend = input) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if ((!text.trim() && !attachedFile) || loading) return;

    const userMessage = {
      id: Date.now(),
      text: text,
      file: attachedFile,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const currentFile = attachedFile;
    setAttachedFile(null);
    setLoading(true);
    setError(null);

    try {
      const response = await validateIdea(text, currentFile);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError(err.message || 'Validation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
    setInput('');
    setAttachedFile(null);
  };

  const exportPDF = (target = null) => {
    const isSingleMessage = target && typeof target.text === 'string';
    const messagesToExport = isSingleMessage ? [target] : messages;
    if (messagesToExport.length === 0) return;

    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;

      // ── Colours ──────────────────────────────────────────────────────────
      const PRIMARY   = [67, 97, 238];   // indigo-blue
      const DARK      = [23, 23, 37];    // near-black
      const GRAY      = [90, 90, 110];
      const LIGHT_BG  = [245, 246, 255]; // soft lavender-white
      const ACCENT    = [99, 179, 136];  // green for user badge
      const WHITE     = [255, 255, 255];

      let pageNum = 1;
      const totalQuestions = messagesToExport.filter(m => m.isUser).length;

      // ── Helper: draw header on every new page ─────────────────────────────
      const drawPageHeader = () => {
        // gradient bar
        doc.setFillColor(...PRIMARY);
        doc.rect(0, 0, pageWidth, 22, 'F');

        // small logo circle
        doc.setFillColor(...WHITE);
        doc.circle(margin + 4, 11, 4, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...PRIMARY);
        doc.setFont('helvetica', 'bold');
        doc.text('AI', margin + 4, 13, { align: 'center' });

        // title
        doc.setFontSize(11);
        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'bold');
        doc.text('Startup Intel AI — Idea Validation Report', margin + 12, 13);

        // date right
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 13, { align: 'right' });
      };

      // ── Helper: draw footer ───────────────────────────────────────────────
      const drawPageFooter = () => {
        doc.setFillColor(...LIGHT_BG);
        doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
        doc.text('Confidential — Generated by Startup Intel AI', margin, pageHeight - 5);
        doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
      };

      // ── Helper: safe new page ─────────────────────────────────────────────
      const newPage = () => {
        drawPageFooter();
        doc.addPage();
        pageNum++;
        drawPageHeader();
        return 30; // yPos after header
      };

      // ── Helper: check space, add page if needed ───────────────────────────
      const ensureSpace = (yPos, needed = 14) => {
        if (yPos + needed > pageHeight - 16) return newPage();
        return yPos;
      };

      // ── Helper: strip emojis & trim ───────────────────────────────────────
      const clean = (text) =>
        (text || '')
          .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')   // strip bold markers for PDF
          .trim();

      // ── COVER PAGE ────────────────────────────────────────────────────────
      // Deep gradient
      doc.setFillColor(...PRIMARY);
      doc.rect(0, 0, pageWidth, pageHeight * 0.55, 'F');

      // Big circle decoration
      doc.setFillColor(255, 255, 255, 0.05);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.3);
      doc.circle(pageWidth - 20, 20, 45, 'S');
      doc.circle(pageWidth - 20, 20, 30, 'S');

      // Logo badge
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 30, 28, 14, 3, 3, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...PRIMARY);
      doc.setFont('helvetica', 'bold');
      doc.text('STARTUP', margin + 14, 38, { align: 'center' });
      doc.text('INTEL AI', margin + 14, 42, { align: 'center' });

      // Main title
      doc.setFontSize(28);
      doc.setTextColor(...WHITE);
      doc.setFont('helvetica', 'bold');
      doc.text('Startup Idea', margin, 72);
      doc.text('Validation Report', margin, 84);

      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 210, 255);
      doc.text('AI-Powered Strategy Analysis & Execution Playbook', margin, 95);

      // Stats row
      const statsY = 115;
      const statW = (contentWidth) / 3;
      [
        ['Questions Asked', String(totalQuestions)],
        ['Report Type', isSingleMessage ? 'Single Q&A' : 'Full Session'],
        ['Generated', new Date().toLocaleDateString()],
      ].forEach(([label, val], i) => {
        const x = margin + i * statW;
        doc.setFillColor(255, 255, 255, 0.12);
        doc.setFillColor(80, 110, 220);
        doc.roundedRect(x, statsY, statW - 4, 20, 3, 3, 'F');
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...WHITE);
        doc.text(val, x + (statW - 4) / 2, statsY + 9, { align: 'center' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 200, 255);
        doc.text(label, x + (statW - 4) / 2, statsY + 16, { align: 'center' });
      });

      // Divider
      doc.setDrawColor(...WHITE);
      doc.setLineWidth(0.3);
      doc.line(margin, 142, pageWidth - margin, 142);

      // Cover body (light area)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...DARK);
      doc.text('What\'s inside this report:', margin, 158);

      const bullets = [
        '  Problem clarity & market validation for each idea',
        '  Ideal target users and where to find your first customers',
        '  MVP strategy — what to build and what to skip',
        '  Step-by-step 30-day execution plan with tech stack',
        '  Growth strategy (zero paid ads) and monetization model',
        '  Key risks and how to mitigate them for each idea',
      ];
      doc.setFontSize(9.5);
      doc.setTextColor(...GRAY);
      bullets.forEach((b, i) => {
        doc.text(b, margin, 167 + i * 8);
      });

      // Cover footer strip
      doc.setFillColor(...LIGHT_BG);
      doc.rect(0, pageHeight - 22, pageWidth, 22, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text('Confidential — For Founder Use Only', margin, pageHeight - 12);
      doc.text('Page 1', pageWidth - margin, pageHeight - 12, { align: 'right' });

      // ── CONTENT PAGES ─────────────────────────────────────────────────────
      doc.addPage();
      pageNum++;
      drawPageHeader();

      let yPos = 30;
      let qNum = 0;

      // Group messages into Q&A pairs
      const pairs = [];
      let currentQ = null;
      messagesToExport.forEach(msg => {
        if (msg.isUser) {
          currentQ = msg;
        } else if (currentQ) {
          pairs.push({ question: currentQ, answer: msg });
          currentQ = null;
        }
      });
      // lone question with no answer yet
      if (currentQ) pairs.push({ question: currentQ, answer: null });

      pairs.forEach(({ question, answer }) => {
        qNum++;

        // ── Question card ─────────────────────────────────────────────────
        yPos = ensureSpace(yPos, 28);

        // Number badge
        doc.setFillColor(...PRIMARY);
        doc.circle(margin + 4, yPos + 4, 4.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'bold');
        doc.text(String(qNum), margin + 4, yPos + 6, { align: 'center' });

        // "Question" label
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
        doc.text('QUESTION', margin + 12, yPos + 2);

        // Question text
        const qText = clean(question.text);
        const qLines = doc.splitTextToSize(qText, contentWidth - 14);
        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.text(qLines, margin + 12, yPos + 8);

        const qBlockH = Math.max(18, qLines.length * 6 + 10);

        // Light card background
        doc.setFillColor(...LIGHT_BG);
        doc.roundedRect(margin, yPos - 2, contentWidth, qBlockH, 3, 3, 'F');
        // Re-draw text on top of bg (order fix: draw bg first, then text)
        doc.setFillColor(...PRIMARY);
        doc.circle(margin + 4, yPos + 4, 4.5, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...WHITE);
        doc.setFont('helvetica', 'bold');
        doc.text(String(qNum), margin + 4, yPos + 6, { align: 'center' });
        doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.setFont('helvetica', 'normal');
        doc.text('QUESTION', margin + 12, yPos + 2);
        doc.setFontSize(11);
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'bold');
        doc.text(qLines, margin + 12, yPos + 8);

        yPos += qBlockH + 6;

        if (!answer) return;

        // ── Answer section ─────────────────────────────────────────────────
        const answerText = clean(answer.text);
        const rawLines = answerText.split('\n');

        rawLines.forEach(rawLine => {
          const line = rawLine.trim();
          yPos = ensureSpace(yPos, 12);

          // === Heading level 3 (###)
          if (line.startsWith('### ')) {
            const heading = line.replace(/^#+\s*/, '');
            yPos = ensureSpace(yPos, 14);

            // Colored left bar
            doc.setFillColor(...PRIMARY);
            doc.rect(margin, yPos - 1, 3, 9, 'F');

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...PRIMARY);
            const hLines = doc.splitTextToSize(heading, contentWidth - 8);
            doc.text(hLines, margin + 6, yPos + 6);
            yPos += hLines.length * 6 + 5;

          // === Heading level 2 (##)
          } else if (line.startsWith('## ')) {
            const heading = line.replace(/^#+\s*/, '');
            yPos = ensureSpace(yPos, 16);
            doc.setFillColor(...LIGHT_BG);
            doc.roundedRect(margin, yPos - 2, contentWidth, 12, 2, 2, 'F');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...DARK);
            doc.text(heading, margin + 4, yPos + 7);
            yPos += 16;

          // === Heading level 4 (####)
          } else if (line.startsWith('#### ')) {
            const heading = line.replace(/^#+\s*/, '');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...DARK);
            const hLines = doc.splitTextToSize(heading, contentWidth);
            doc.text(hLines, margin, yPos + 5);
            yPos += hLines.length * 6 + 4;

          // === Numbered list (1. 2. 3.)
          } else if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+)\./)[1];
            const text = line.replace(/^\d+\.\s*/, '');
            doc.setFillColor(...PRIMARY);
            doc.circle(margin + 2.5, yPos + 2.5, 2.5, 'F');
            doc.setFontSize(7.5);
            doc.setTextColor(...WHITE);
            doc.setFont('helvetica', 'bold');
            doc.text(num, margin + 2.5, yPos + 4, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 70);
            const listLines = doc.splitTextToSize(text, contentWidth - 10);
            doc.text(listLines, margin + 8, yPos + 4);
            yPos += listLines.length * 6 + 2;

          // === Bullet list (- or *)
          } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
            const text = line.replace(/^[-*•]\s*/, '');
            doc.setFillColor(...PRIMARY);
            doc.circle(margin + 2.5, yPos + 2.5, 1.5, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 70);
            const bLines = doc.splitTextToSize(text, contentWidth - 10);
            doc.text(bLines, margin + 8, yPos + 4);
            yPos += bLines.length * 6 + 2;

          // === Horizontal rule (---)
          } else if (/^[-*=]{3,}$/.test(line)) {
            doc.setDrawColor(...LIGHT_BG);
            doc.setLineWidth(0.5);
            doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
            yPos += 6;

          // === Empty line
          } else if (line === '') {
            yPos += 3;

          // === Normal paragraph
          } else {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...GRAY);
            const pLines = doc.splitTextToSize(line, contentWidth);
            doc.text(pLines, margin, yPos + 4);
            yPos += pLines.length * 6 + 2;
          }
        });

        // Spacer + divider between Q&A blocks
        yPos += 4;
        doc.setDrawColor(220, 220, 235);
        doc.setLineWidth(0.4);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      });

      // Final footer on last page
      drawPageFooter();

      // ── Save ──────────────────────────────────────────────────────────────
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `startup-intel-report-${isSingleMessage ? 'single' : 'full'}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 0, sm: 4 }, 
        px: { xs: 0, sm: 3 },
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <AnimatePresence>
        <StyledPaper elevation={0} component={motion.div} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          
          {/* Animated Background Graphics - Desktop Only */}
          {messages.length === 0 && (
            <Box sx={{ display: { xs: 'none', sm: 'block' }, position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <FloatingShape 
                color={theme.palette.primary.main} 
                animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }} 
                transition={{ duration: 15, repeat: Infinity }}
                style={{ top: '10%', left: '5%' }}
              />
              <FloatingShape 
                color={theme.palette.secondary.main} 
                animate={{ x: [0, -40, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }} 
                transition={{ duration: 20, repeat: Infinity }}
                style={{ bottom: '20%', right: '10%' }}
              />
            </Box>
          )}

          <Header>
            <Stack 
              direction="row" 
              spacing={{ xs: 1, sm: 2.5 }} 
              alignItems="center"
              sx={{ justifyContent: 'flex-start' }}
            >
              <Avatar sx={{ 
                bgcolor: alpha('#fff', 0.25), 
                width: { xs: 24, sm: 48 }, 
                height: { xs: 24, sm: 48 }, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
              }}>
                <RocketLaunch sx={{ color: '#fff', fontSize: { xs: 14, sm: 24 } }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="800" sx={{ lineHeight: 1, letterSpacing: -0.5, fontSize: { xs: '0.8rem', sm: '1.25rem' } }}>
                  Startup Intel AI
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500, display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5, fontSize: '0.75rem' }}>
                  <AutoGraph sx={{ fontSize: 12 }} /> Strategy Analysis Active
                </Typography>
              </Box>
            </Stack>
            
            <Stack direction="row" spacing={{ xs: 0.8, sm: 1.5 }}>
              <Tooltip title="Switch Visual Theme">
                <IconButton onClick={colorMode.toggleColorMode} size="small" sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), p: { xs: 0.8, sm: 1 } }}>
                  {theme.palette.mode === 'dark' ? <LightMode sx={{ fontSize: { xs: 20, sm: 24 } }} /> : <DarkMode sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Strategy Report">
                <IconButton onClick={exportPDF} disabled={messages.length === 0} size="small" sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), p: { xs: 0.8, sm: 1 } }}>
                  <Download sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="New Pitch Analysis">
                <IconButton onClick={resetChat} size="small" sx={{ color: 'white', bgcolor: alpha('#fff', 0.1), p: { xs: 0.8, sm: 1 } }}>
                  <Refresh sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Header>

          <MessagesContainer>
            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  onClose={() => setError(null)}
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3, 
                    fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid currentColor'
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}
            {messages.length === 0 ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center',
                px: 4,
                position: 'relative',
                zIndex: 2
              }}>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  <Box sx={{ 
                    mt: { xs: 2.5, sm: 0 },
                    mb: { xs: 2, sm: 4 }, 
                    display: 'inline-flex', 
                    p: { xs: 1.2, sm: 3 }, 
                    borderRadius: '35% 65% 65% 35% / 45% 45% 55% 55%', 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                  }}>
                    <SmartToy sx={{ fontSize: { xs: 28, sm: 56 }, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography variant="h4" fontWeight="900" gutterBottom sx={{ 
                    letterSpacing: -1, 
                    fontSize: { xs: '1.5rem', sm: '2.5rem' },
                    lineHeight: 1.1,
                    mb: 1.5,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                  }}>
                    Shark Tank Ready?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ 
                    mb: { xs: 2.5, sm: 4 }, 
                    maxWidth: 500, 
                    fontSize: { xs: '0.8rem', sm: '1.1rem' }, 
                    lineHeight: 1.4,
                    fontWeight: 500,
                    px: 3
                  }}>
                    Analyze your idea's PMF, unit economics, and scalability in seconds.
                  </Typography>
                  
                  <Stack direction="column" alignItems="center" spacing={1.2} sx={{ width: '100%', px: 2 }}>
                    {exampleIdeas.map((idea, idx) => (
                      <Box 
                        key={idx} 
                        onClick={() => handleSend(idea)}
                        component={motion.div}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        sx={{ 
                          borderRadius: '14px', 
                          px: 2, 
                          py: { xs: 1.2, sm: 2 }, 
                          maxWidth: 500,
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.2,
                          borderColor: alpha(theme.palette.divider, 0.12),
                          border: '1px solid',
                          background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.03)',
                          backdropFilter: 'blur(10px)',
                          '&:hover': { 
                            borderColor: theme.palette.primary.main,
                            background: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.primary.main, 0.05)
                          }
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: { xs: '0.8rem', sm: '0.95rem' },
                            lineHeight: 1.3,
                            color: theme.palette.text.primary
                          }}
                        >
                          {idea}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </motion.div>
              </Box>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((msg) => (
                  <MessageBubble 
                    key={msg.id} 
                    isUser={msg.isUser}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', bounce: 0.35, duration: 0.6 }}
                  >
                    {!msg.isUser && (
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          width: 36,
                          height: 36,
                          mt: 0.8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        <SmartToy fontSize="small" />
                      </Avatar>
                    )}
                    <Box sx={{ maxWidth: '100%' }}>
                      <MessageContent isUser={msg.isUser} elevation={msg.isUser ? 8 : 1}>
                        {msg.file && (
                          <Box sx={{ mb: msg.text ? 2 : 0 }}>
                            {msg.file.type?.startsWith('image/') ? (
                              <ImageContainer>
                                <img src={msg.file.data} alt={msg.file.name || 'Uploaded image'} />
                              </ImageContainer>
                            ) : (
                              <AttachmentCard isUser={msg.isUser}>
                                <FileIcon type={msg.file.type || ''} sx={{ fontSize: 24 }} />
                                <Box>
                                  <Typography variant="body2" fontWeight="700" noWrap sx={{ maxWidth: 200 }}>
                                    {msg.file.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    {msg.file.size} • document
                                  </Typography>
                                </Box>
                                <Download sx={{ ml: 'auto', fontSize: 18, opacity: 0.5 }} />
                              </AttachmentCard>
                            )}
                          </Box>
                        )}
                        {msg.text && (
                          msg.isUser ? (
                            <Typography variant="body1" fontWeight="500">{msg.text}</Typography>
                          ) : (
                            <Box className="markdown-content">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </Box>
                          )
                        )}
                      </MessageContent>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: msg.isUser ? 'flex-end' : 'flex-start', mt: 0.8, px: 1, fontWeight: 500, gap: 1 }}
                      >
                        {msg.timestamp}
                        {!msg.isUser && (
                          <Tooltip title="Download this analysis as PDF">
                            <IconButton 
                              size="small" 
                              onClick={() => exportPDF(msg)}
                              sx={{ 
                                p: 0.5, 
                                opacity: 0.6, 
                                '&:hover': { opacity: 1, color: theme.palette.primary.main } 
                              }}
                            >
                              <PictureAsPdf sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    {msg.isUser && (
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: 36,
                          height: 36,
                          mt: 0.8,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Person fontSize="small" />
                      </Avatar>
                    )}
                  </MessageBubble>
                ))}
                
                {loading && (
                  <MessageBubble 
                    isUser={false} 
                    layout
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 36, height: 36, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      <SmartToy fontSize="small" />
                    </Avatar>
                    <Box sx={{ width: '100%', maxWidth: 450 }}>
                      <MessageContent isUser={false} elevation={1}>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TypingIndicator />
                            <Typography variant="body2" fontWeight="700" color="secondary.main" sx={{ letterSpacing: 0.5 }}>
                              STRATEGY ANALYST REVIEWING...
                            </Typography>
                          </Box>
                          <Skeleton variant="text" width="75%" height={24} sx={{ borderRadius: 1 }} />
                          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
                          <Skeleton variant="text" width="45%" height={24} sx={{ borderRadius: 1 }} />
                        </Stack>
                      </MessageContent>
                    </Box>
                  </MessageBubble>
                )}
              </AnimatePresence>
            )}
            
            <div ref={messagesEndRef} />
          </MessagesContainer>

          <InputArea>
            <AnimatePresence>
              {attachedFile && (
                <Fade in>
                  <FilePreviewArea>
                    <Paper 
                      elevation={8} 
                      sx={{ 
                        p: 1.5, 
                        borderRadius: 3, 
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.95),
                        border: `2px solid ${theme.palette.success.main}`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`,
                        minWidth: 200
                      }}
                    >
                      {attachedFile.type.startsWith('image/') ? (
                        <img 
                          src={attachedFile.data} 
                          alt="Preview" 
                          style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 4 }} 
                        />
                      ) : (
                        <FileIcon type={attachedFile.type} sx={{ fontSize: 32, color: theme.palette.success.main }} />
                      )}
                      <Box sx={{ mr: 2 }}>
                        <Typography variant="body2" fontWeight="800" noWrap sx={{ maxWidth: 150 }}>
                          {attachedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {attachedFile.size}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={removeFile}
                        sx={{ 
                          position: 'absolute', 
                          top: -12, 
                          right: -12, 
                          bgcolor: 'success.main', 
                          color: 'white',
                          p: 0.3,
                          '&:hover': { bgcolor: 'success.dark', scale: 1.1 },
                          transition: 'all 0.2s'
                        }}
                      >
                        <Close sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Paper>
                  </FilePreviewArea>
                </Fade>
              )}
            </AnimatePresence>

            <Stack direction="row" spacing={2} alignItems="flex-end">
              <Tooltip title="Upload Deck (PDF), Logo (Image) or Business Plan (Doc)">
                <IconButton 
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ 
                    height: 56, 
                    width: 56, 
                    borderRadius: '20px',
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    color: attachedFile ? theme.palette.success.main : theme.palette.text.secondary,
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1), scale: 1.05 },
                    transition: 'all 0.2s'
                  }}
                >
                  <AttachFile />
                </IconButton>
              </Tooltip>
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
              <TextField
                inputRef={inputRef}
                fullWidth
                multiline
                maxRows={4}
                placeholder={attachedFile ? `Add details about ${attachedFile.name}...` : "Pitch your disruptor idea or upload deck..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '18px',
                    bgcolor: theme.palette.mode === 'light' ? '#fff' : alpha(theme.palette.background.paper, 0.8),
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    fontWeight: 500,
                    transition: 'all 0.3s',
                    padding: { xs: '8px 4px', sm: '12px 8px' },
                    '&.Mui-focused': {
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
                      borderColor: theme.palette.primary.main,
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                disableElevation
                onClick={() => handleSend()}
                disabled={(!input.trim() && !attachedFile) || loading}
                sx={{
                  height: { xs: 44, sm: 56 },
                  minWidth: { xs: 44, sm: 56 },
                  borderRadius: '16px',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': { scale: 1.05, boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}` },
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <Send />}
              </Button>
            </Stack>

            <Box sx={{ mt: 0.5, textAlign: 'center' }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: alpha(theme.palette.text.secondary, 0.6), 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.6rem', sm: '0.75rem' }
                }}
              >
                Developed by 
                <Box 
                  component="a" 
                  href="https://www.linkedin.com/in/amit-kumar-yadav-52a56529a/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    color: theme.palette.primary.main, 
                    textDecoration: 'none', 
                    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.2s',
                    '&:hover': { 
                      color: theme.palette.secondary.main,
                      borderBottomColor: theme.palette.secondary.main,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Amit Kumar Yadav
                </Box>
              </Typography>
            </Box>
          </InputArea>
        </StyledPaper>
      </AnimatePresence>
    </Container>
  );
};

export default ChatInterface;
