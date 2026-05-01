import React, { FC, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import WebView from 'react-native-webview';
import {
  ArrowLeft,
  Check,
  FileText,
  Download,
  Share2,
  Plus,
  Trash2,
  Eye,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Award,
  Wrench,
  Palette,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  X,
  RefreshCw,
  ZoomIn,
  Save,
  Cloud,
  CloudOff,
  Upload,
} from 'lucide-react-native';
import { generatePDF as createPDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { C } from '.';
import { styles } from './ResumeBuilderScreenStyles';
import {
  getResumeDataAction,
  saveResumeDataAction,
  uploadResumePDFAction,
} from '../../stores/actions/jobAction';
import { getToken } from '../../services/rest';
import { useFocusEffect } from '@react-navigation/native';
import { StoreState } from '../../models/reduxModel';
import { IResumeResponse } from '../../models/jobModel';
import { moveToCache, safeParse } from '../../utils';
import Toast from 'react-native-toast-message';
import { stat } from 'react-native-fs';
import { baseServiceUrl, urls } from '../../environments';
import {
  BeginApiCallAction,
  LoadingStopAction,
} from '../../stores/actions/apiStatusAction';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────
interface Education {
  id: string;
  degree: string;
  school: string;
  gradYear: string;
  grade: string;
}
interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}
interface Certification {
  id: string;
  name: string;
  org: string;
  year: string;
}

interface ResumeData {
  name: string;
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  tagline: string;
  educations: Education[];
  isFresher: boolean;
  careerObjective: string;
  experiences: Experience[];
  hasCert: boolean;
  certifications: Certification[];
  skills: string[];
  languages: string[];
  resume_id?:any;
}

// Server resume shape — adapt field names to your API
interface ServerResume {
  id?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  linkedin?: string;
  tagline?: string;
  is_fresher?: boolean;
  career_objective?: string;
  resume_id?:string;
  educations?: Array<{
    degree: string;
    school: string;
    grad_year: string;
    grade: string;
  }>;
  experiences?: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  has_certifications?: boolean;
  certifications?: Array<{ name: string; org: string; year: string }>;
  skills?: string[];
  languages?: string[];
  layout_id?: number;
}

// Save status for UI feedback
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const generateId = () => Math.random().toString(36).substring(2, 9);

// ─── LAYOUT VARIANTS ──────────────────────────────────────────────────────────
const LAYOUTS = [
  { id: 0, name: 'Classic', desc: 'Clean single column', icon: '▤' },
  { id: 1, name: 'Sidebar', desc: 'Left panel + main content', icon: '▥' },
  { id: 2, name: 'Modern', desc: 'Header banner, two cols', icon: '▦' },
  { id: 3, name: 'Minimal', desc: 'Ultra clean, no borders', icon: '▧' },
];

// ─── HTML GENERATORS ──────────────────────────────────────────────────────────
const SHARED_CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size:10.5pt; line-height:1.5; color:#111; background:#fff; }
  .page { max-width:210mm; margin:0 auto; }
`;

const htmlClassic = (
  d: ResumeData,
) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${SHARED_CSS}
.page{padding:32px 36px}
.header{border-bottom:2.5px solid #111;padding-bottom:14px;margin-bottom:20px}
.name{font-size:24px;font-weight:900;letter-spacing:-0.5px}
.tagline{font-size:11px;color:#555;margin-top:3px;font-weight:500}
.contacts{display:flex;flex-wrap:wrap;gap:10px;margin-top:8px}
.contact-item{font-size:9.5px;color:#333}
.section{margin-bottom:18px}
.section-title{font-size:9px;font-weight:900;letter-spacing:2px;text-transform:uppercase;border-bottom:1.5px solid #111;padding-bottom:4px;margin-bottom:10px}
.entry{margin-bottom:10px}
.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-size:11.5px;font-weight:800}
.entry-date{font-size:9.5px;color:#555;font-weight:600}
.entry-sub{font-size:10px;color:#555;margin-top:1px}
.entry-grade{font-size:9.5px;font-weight:700;margin-top:2px}
.entry-desc{font-size:9.5px;color:#555;margin-top:4px;line-height:1.5}
.objective{font-size:10px;color:#444;line-height:1.6;font-style:italic}
.skills-grid{display:flex;flex-wrap:wrap;gap:5px}
.skill-tag{border:1px solid #999;padding:3px 10px;border-radius:3px;font-size:9px;font-weight:700}
.lang-tag{background:#f5f5f5;border:1px solid #ddd;padding:3px 10px;border-radius:20px;font-size:9px;font-weight:600;color:#444}
</style></head><body><div class="page">
<div class="header">
  <div class="name">${d.name || 'Your Name'}</div>
  <div class="tagline">${d.tagline || 'Your Professional Tagline'}</div>
  <div class="contacts">
    ${d.phone ? `<span class="contact-item">📞 ${d.phone}</span>` : ''}
    ${d.email ? `<span class="contact-item">✉ ${d.email}</span>` : ''}
    ${d.address ? `<span class="contact-item">📍 ${d.address}</span>` : ''}
    ${d.linkedin ? `<span class="contact-item">🔗 ${d.linkedin}</span>` : ''}
  </div>
</div>
${
  d.isFresher
    ? `<div class="section"><div class="section-title">Career Objective</div><div class="objective">${
        d.careerObjective || 'Your career objective...'
      }</div></div>`
    : ''
}
<div class="section"><div class="section-title">Education</div>
  ${d.educations
    .map(
      e =>
        `<div class="entry"><div class="entry-header"><span class="entry-title">${
          e.degree || 'Degree'
        }</span><span class="entry-date">${
          e.gradYear
        }</span></div><div class="entry-sub">${
          e.school || 'Institution'
        }</div>${
          e.grade ? `<div class="entry-grade">${e.grade}</div>` : ''
        }</div>`,
    )
    .join('')}
</div>
${
  !d.isFresher
    ? `<div class="section"><div class="section-title">Work Experience</div>${d.experiences
        .map(
          e =>
            `<div class="entry"><div class="entry-header"><span class="entry-title">${
              e.role || 'Role'
            }</span><span class="entry-date">${
              e.duration
            }</span></div><div class="entry-sub">${
              e.company || 'Company'
            }</div><div class="entry-desc">${(e.description || '').replace(
              /\n/g,
              '<br/>',
            )}</div></div>`,
        )
        .join('')}</div>`
    : ''
}
${
  d.hasCert
    ? `<div class="section"><div class="section-title">Certifications</div>${d.certifications
        .map(
          c =>
            `<div class="entry"><div class="entry-header"><span class="entry-title">${c.name}</span><span class="entry-date">${c.year}</span></div><div class="entry-sub">${c.org}</div></div>`,
        )
        .join('')}</div>`
    : ''
}
${
  d.skills.length
    ? `<div class="section"><div class="section-title">Skills</div><div class="skills-grid">${d.skills
        .map(s => `<span class="skill-tag">${s}</span>`)
        .join('')}</div></div>`
    : ''
}
${
  d.languages.length
    ? `<div class="section"><div class="section-title">Languages</div><div class="skills-grid">${d.languages
        .map(l => `<span class="lang-tag">${l}</span>`)
        .join('')}</div></div>`
    : ''
}
</div></body></html>`;

const htmlSidebar = (
  d: ResumeData,
) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${SHARED_CSS}
.page{display:flex;min-height:100vh}
.sidebar{width:38%;background:#1a1a1a;color:#fff;padding:28px 20px}
.main{flex:1;padding:28px 24px}
.avatar{width:64px;height:64px;border-radius:50%;background:#444;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;margin-bottom:14px;color:#fff}
.s-name{font-size:18px;font-weight:900;line-height:1.2;margin-bottom:4px}
.s-tagline{font-size:9.5px;color:#aaa;margin-bottom:18px;line-height:1.5}
.s-section{margin-bottom:18px}
.s-title{font-size:8px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#888;border-bottom:1px solid #444;padding-bottom:4px;margin-bottom:10px}
.s-item{font-size:9.5px;color:#ccc;margin-bottom:5px}
.s-skill{display:inline-block;background:#333;padding:3px 8px;border-radius:3px;font-size:8.5px;margin:2px 2px 2px 0;color:#ddd}
.m-section{margin-bottom:16px}
.m-title{font-size:9px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;border-bottom:2px solid #111;padding-bottom:4px;margin-bottom:10px}
.entry{margin-bottom:10px}
.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-size:11.5px;font-weight:800}
.entry-date{font-size:9px;color:#666;font-weight:600}
.entry-sub{font-size:10px;color:#666;margin-top:1px}
.entry-desc{font-size:9.5px;color:#555;margin-top:4px;line-height:1.5}
.objective{font-size:10px;color:#444;line-height:1.6;font-style:italic}
</style></head><body><div class="page">
<div class="sidebar">
  <div class="avatar">${(d.name || '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()}</div>
  <div class="s-name">${d.name || 'Your Name'}</div>
  <div class="s-tagline">${d.tagline || 'Professional Title'}</div>
  ${
    d.phone || d.email || d.address || d.linkedin
      ? `<div class="s-section"><div class="s-title">Contact</div>
    ${d.phone ? `<div class="s-item">📞 ${d.phone}</div>` : ''}
    ${d.email ? `<div class="s-item">✉ ${d.email}</div>` : ''}
    ${d.address ? `<div class="s-item">📍 ${d.address}</div>` : ''}
    ${d.linkedin ? `<div class="s-item">🔗 ${d.linkedin}</div>` : ''}
  </div>`
      : ''
  }
  ${
    d.skills.length
      ? `<div class="s-section"><div class="s-title">Skills</div>${d.skills
          .map(s => `<span class="s-skill">${s}</span>`)
          .join('')}</div>`
      : ''
  }
  ${
    d.languages.length
      ? `<div class="s-section"><div class="s-title">Languages</div>${d.languages
          .map(l => `<div class="s-item">• ${l}</div>`)
          .join('')}</div>`
      : ''
  }
</div>
<div class="main">
  ${
    d.isFresher
      ? `<div class="m-section"><div class="m-title">Career Objective</div><div class="objective">${d.careerObjective}</div></div>`
      : ''
  }
  <div class="m-section"><div class="m-title">Education</div>
    ${d.educations
      .map(
        e =>
          `<div class="entry"><div class="entry-header"><span class="entry-title">${
            e.degree || 'Degree'
          }</span><span class="entry-date">${
            e.gradYear
          }</span></div><div class="entry-sub">${
            e.school || 'Institution'
          }</div>${
            e.grade
              ? `<div style="font-size:9.5px;font-weight:700;margin-top:2px;">${e.grade}</div>`
              : ''
          }</div>`,
      )
      .join('')}
  </div>
  ${
    !d.isFresher
      ? `<div class="m-section"><div class="m-title">Work Experience</div>${d.experiences
          .map(
            e =>
              `<div class="entry"><div class="entry-header"><span class="entry-title">${
                e.role || 'Role'
              }</span><span class="entry-date">${
                e.duration
              }</span></div><div class="entry-sub">${
                e.company || 'Company'
              }</div><div class="entry-desc">${(e.description || '').replace(
                /\n/g,
                '<br/>',
              )}</div></div>`,
          )
          .join('')}</div>`
      : ''
  }
  ${
    d.hasCert
      ? `<div class="m-section"><div class="m-title">Certifications</div>${d.certifications
          .map(
            c =>
              `<div class="entry"><div class="entry-header"><span class="entry-title">${c.name}</span><span class="entry-date">${c.year}</span></div><div class="entry-sub">${c.org}</div></div>`,
          )
          .join('')}</div>`
      : ''
  }
</div>
</div></body></html>`;

const htmlModern = (
  d: ResumeData,
) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${SHARED_CSS}
.header{background:#111;color:#fff;padding:24px 32px}
.header-inner{display:flex;align-items:center;gap:20px}
.avatar{width:60px;height:60px;border-radius:8px;background:#333;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;flex-shrink:0;color:#fff}
.name{font-size:22px;font-weight:900}
.tagline{font-size:10px;color:#aaa;margin-top:3px}
.contacts{display:flex;flex-wrap:wrap;gap:14px;margin-top:8px}
.c-item{font-size:9px;color:#ccc}
.body{display:flex}
.col-left{width:35%;padding:20px 16px 20px 32px;border-right:1px solid #e5e5e5}
.col-right{flex:1;padding:20px 32px 20px 20px}
.s-title{font-size:8.5px;font-weight:900;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;padding-bottom:4px;border-bottom:1.5px solid #111}
.section{margin-bottom:18px}
.entry{margin-bottom:10px}
.entry-header{display:flex;justify-content:space-between;align-items:baseline}
.entry-title{font-size:11px;font-weight:800}
.entry-date{font-size:9px;color:#666;font-weight:600}
.entry-sub{font-size:9.5px;color:#666;margin-top:1px}
.entry-desc{font-size:9.5px;color:#555;margin-top:4px;line-height:1.5}
.objective{font-size:10px;color:#444;line-height:1.6;font-style:italic}
.skill-tag{display:inline-block;border:1px solid #999;padding:3px 8px;border-radius:3px;font-size:8.5px;font-weight:700;margin:2px 2px 2px 0}
.lang-item{font-size:10px;margin-bottom:5px;color:#333}
</style></head><body>
<div class="header">
  <div class="header-inner">
    <div class="avatar">${(d.name || '?')
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()}</div>
    <div><div class="name">${d.name || 'Your Name'}</div><div class="tagline">${
  d.tagline || 'Professional Title'
}</div></div>
  </div>
  <div class="contacts">
    ${d.phone ? `<span class="c-item">📞 ${d.phone}</span>` : ''}
    ${d.email ? `<span class="c-item">✉ ${d.email}</span>` : ''}
    ${d.address ? `<span class="c-item">📍 ${d.address}</span>` : ''}
    ${d.linkedin ? `<span class="c-item">🔗 ${d.linkedin}</span>` : ''}
  </div>
</div>
<div class="body">
  <div class="col-left">
    ${
      d.skills.length
        ? `<div class="section"><div class="s-title">Skills</div>${d.skills
            .map(s => `<span class="skill-tag">${s}</span>`)
            .join('')}</div>`
        : ''
    }
    ${
      d.languages.length
        ? `<div class="section"><div class="s-title">Languages</div>${d.languages
            .map(l => `<div class="lang-item">• ${l}</div>`)
            .join('')}</div>`
        : ''
    }
    ${
      d.hasCert
        ? `<div class="section"><div class="s-title">Certifications</div>${d.certifications
            .map(
              c =>
                `<div class="entry"><div class="entry-title">${c.name}</div><div class="entry-sub">${c.org} · ${c.year}</div></div>`,
            )
            .join('')}</div>`
        : ''
    }
  </div>
  <div class="col-right">
    ${
      d.isFresher
        ? `<div class="section"><div class="s-title">Career Objective</div><div class="objective">${d.careerObjective}</div></div>`
        : ''
    }
    <div class="section"><div class="s-title">Education</div>
      ${d.educations
        .map(
          e =>
            `<div class="entry"><div class="entry-header"><span class="entry-title">${
              e.degree || 'Degree'
            }</span><span class="entry-date">${
              e.gradYear
            }</span></div><div class="entry-sub">${
              e.school || 'Institution'
            }</div>${
              e.grade
                ? `<div style="font-size:9px;font-weight:700;margin-top:2px;">${e.grade}</div>`
                : ''
            }</div>`,
        )
        .join('')}
    </div>
    ${
      !d.isFresher
        ? `<div class="section"><div class="s-title">Work Experience</div>${d.experiences
            .map(
              e =>
                `<div class="entry"><div class="entry-header"><span class="entry-title">${
                  e.role || 'Role'
                }</span><span class="entry-date">${
                  e.duration
                }</span></div><div class="entry-sub">${
                  e.company || 'Company'
                }</div><div class="entry-desc">${(e.description || '').replace(
                  /\n/g,
                  '<br/>',
                )}</div></div>`,
            )
            .join('')}</div>`
        : ''
    }
  </div>
</div>
</body></html>`;

const htmlMinimal = (
  d: ResumeData,
) => `<!DOCTYPE html><html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${SHARED_CSS}
.page{padding:40px 44px}
.name{font-size:28px;font-weight:900;letter-spacing:-1px;margin-bottom:2px}
.tagline{font-size:12px;color:#888;font-weight:400;letter-spacing:0.5px;margin-bottom:12px}
.contacts{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #e0e0e0}
.c-item{font-size:9.5px;color:#666}
.section{margin-bottom:22px}
.section-title{font-size:8.5px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#999;margin-bottom:12px}
.entry{margin-bottom:12px;padding-left:16px;border-left:2px solid #e0e0e0}
.entry-title{font-size:12px;font-weight:800}
.entry-meta{font-size:9.5px;color:#888;margin-top:2px}
.entry-desc{font-size:9.5px;color:#666;margin-top:5px;line-height:1.6}
.objective{font-size:11px;color:#555;line-height:1.7;padding-left:16px;border-left:2px solid #e0e0e0;font-style:italic}
.skills-wrap{display:flex;flex-wrap:wrap;gap:6px}
.skill-tag{font-size:9px;font-weight:700;color:#333;padding:4px 10px;border-radius:2px;background:#f5f5f5}
.lang-tag{font-size:9px;color:#666;padding:4px 10px;border-radius:20px;background:#f0f0f0}
</style></head><body><div class="page">
<div class="name">${d.name || 'Your Name'}</div>
<div class="tagline">${d.tagline || 'Professional Title'}</div>
<div class="contacts">
  ${d.phone ? `<span class="c-item">${d.phone}</span>` : ''}
  ${d.email ? `<span class="c-item">${d.email}</span>` : ''}
  ${d.address ? `<span class="c-item">${d.address}</span>` : ''}
  ${d.linkedin ? `<span class="c-item">${d.linkedin}</span>` : ''}
</div>
${
  d.isFresher
    ? `<div class="section"><div class="section-title">Objective</div><div class="objective">${d.careerObjective}</div></div>`
    : ''
}
<div class="section"><div class="section-title">Education</div>
  ${d.educations
    .map(
      e =>
        `<div class="entry"><div class="entry-title">${
          e.degree || 'Degree'
        }</div><div class="entry-meta">${e.school || 'Institution'}${
          e.gradYear ? ' · ' + e.gradYear : ''
        }${e.grade ? ' · ' + e.grade : ''}</div></div>`,
    )
    .join('')}
</div>
${
  !d.isFresher
    ? `<div class="section"><div class="section-title">Experience</div>${d.experiences
        .map(
          e =>
            `<div class="entry"><div class="entry-title">${
              e.role || 'Role'
            }</div><div class="entry-meta">${e.company || 'Company'}${
              e.duration ? ' · ' + e.duration : ''
            }</div><div class="entry-desc">${(e.description || '').replace(
              /\n/g,
              '<br/>',
            )}</div></div>`,
        )
        .join('')}</div>`
    : ''
}
${
  d.hasCert
    ? `<div class="section"><div class="section-title">Certifications</div>${d.certifications
        .map(
          c =>
            `<div class="entry"><div class="entry-title">${
              c.name
            }</div><div class="entry-meta">${c.org}${
              c.year ? ' · ' + c.year : ''
            }</div></div>`,
        )
        .join('')}</div>`
    : ''
}
${
  d.skills.length
    ? `<div class="section"><div class="section-title">Skills</div><div class="skills-wrap">${d.skills
        .map(s => `<span class="skill-tag">${s}</span>`)
        .join('')}</div></div>`
    : ''
}
${
  d.languages.length
    ? `<div class="section"><div class="section-title">Languages</div><div class="skills-wrap">${d.languages
        .map(l => `<span class="lang-tag">${l}</span>`)
        .join('')}</div></div>`
    : ''
}
</div></body></html>`;

const generateResumeHTML = (data: ResumeData, layoutId: number): string => {
  switch (layoutId) {
    case 1:
      return htmlSidebar(data);
    case 2:
      return htmlModern(data);
    case 3:
      return htmlMinimal(data);
    default:
      return htmlClassic(data);
  }
};

// ─── SAVE STATUS BADGE ────────────────────────────────────────────────────────
const SaveBadge: FC<{ status: SaveStatus }> = ({ status }) => {
  if (status === 'idle') return null;

  const configs = {
    saving: {
      bg: '#FEF3C7',
      border: '#F59E0B',
      text: '#92400E',
      label: 'Saving…',
      Icon: () => <ActivityIndicator size={11} color="#92400E" />,
    },
    saved: {
      bg: '#D1FAE5',
      border: '#10B981',
      text: '#065F46',
      label: 'Saved ✓',
      Icon: () => <Check size={11} color="#065F46" strokeWidth={3} />,
    },
    error: {
      bg: '#FEE2E2',
      border: '#EF4444',
      text: '#991B1B',
      label: 'Save failed',
      Icon: () => <CloudOff size={11} color="#991B1B" />,
    },
  };
  const cfg = configs[status];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: cfg.bg,
        borderWidth: 1,
        borderColor: cfg.border,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
      }}
    >
      <cfg.Icon />
      <Text style={{ fontSize: 11, fontWeight: '700', color: cfg.text }}>
        {cfg.label}
      </Text>
    </View>
  );
};

// ─── RESUME PREVIEW MODAL ─────────────────────────────────────────────────────
interface ResumePreviewModalProps {
  visible: boolean;
  html: string;
  title?: string;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  isGenerating?: boolean;
}

const ResumePreviewModal: FC<ResumePreviewModalProps> = ({
  visible,
  html,
  title = 'Resume Preview',
  onClose,
  onDownload,
  onShare,
  isGenerating,
}) => (
  <Modal visible={visible} animationType="slide" statusBarTranslucent>
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111' }}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <View style={previewStyles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={previewStyles.modalClose}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={previewStyles.modalTitle}>{title}</Text>
        <View style={previewStyles.modalActions}>
          {onDownload && (
            <TouchableOpacity
              onPress={onDownload}
              style={previewStyles.modalActionBtn}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Download size={18} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          {onShare && (
            <TouchableOpacity
              onPress={onShare}
              style={previewStyles.modalActionBtn}
              disabled={isGenerating}
            >
              <Share2 size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={previewStyles.hintBar}>
        <ZoomIn size={12} color="#aaa" />
        <Text style={previewStyles.hintText}>
          Pinch to zoom · Scroll to read
        </Text>
      </View>
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: '#fff' }}
        scrollEnabled
        scalesPageToFit
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </SafeAreaView>
  </Modal>
);

const previewStyles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    paddingTop: Platform.OS === 'android' ? 50 : 10,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalActions: { flexDirection: 'row', gap: 8 },
  modalActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
  },
  hintText: { color: '#aaa', fontSize: 11 },
});

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionHeader: FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconWrap}>{icon}</View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const FormField: FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  icon?: React.ReactNode;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  icon,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.formField}>
      <View style={styles.formLabelRow}>
        {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
        <Text style={[styles.formLabel, focused && { color: C.primary }]}>
          {label}
        </Text>
      </View>
      <TextInput
        ref={inputRef}
        style={[
          styles.formInput,
          multiline && styles.formInputMultiline,
          focused && styles.formInputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={returnKeyType || 'next'}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={!multiline}
      />
    </View>
  );
};

const Toggle: FC<{
  value: boolean;
  onChange: (v: boolean) => void;
  title: string;
  subtitle: string;
}> = ({ value, onChange, title, subtitle }) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.toggleTitle}>{title}</Text>
      <Text style={styles.toggleSub}>{subtitle}</Text>
    </View>
    <TouchableOpacity
      style={[styles.toggleSwitch, value && styles.toggleSwitchOn]}
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </TouchableOpacity>
  </View>
);

const ChipInput: FC<{
  chips: string[];
  onChipsChange: (c: string[]) => void;
  placeholder?: string;
}> = ({ chips, onChipsChange, placeholder }) => {
  const [input, setInput] = useState('');
  const addChip = () => {
    const t = input.trim();
    if (t && !chips.includes(t)) {
      onChipsChange([...chips, t]);
      setInput('');
    }
  };
  return (
    <View>
      <View style={styles.chipInputRow}>
        <TextInput
          style={styles.chipTextInput}
          value={input}
          onChangeText={setInput}
          placeholder={placeholder || 'Type and press +'}
          placeholderTextColor={C.textMuted}
          onSubmitEditing={addChip}
          returnKeyType="done"
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.chipAddBtn} onPress={addChip}>
          <Plus size={15} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.chipArea}>
        {chips.length === 0 ? (
          <Text style={styles.chipEmpty}>No items added yet</Text>
        ) : (
          <View style={styles.chipWrap}>
            {chips.map(chip => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {chip}
                </Text>
                <TouchableOpacity
                  onPress={() => onChipsChange(chips.filter(c => c !== chip))}
                  style={styles.chipX}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <X size={10} color={C.primary} strokeWidth={3} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const MiniPreview: FC<{ html: string; onTap: () => void }> = ({
  html,
  onTap,
}) => (
  <View style={miniStyles.container}>
    <View style={miniStyles.browser}>
      <View style={miniStyles.browserBar}>
        {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
          <View
            key={c}
            style={[miniStyles.browserDot, { backgroundColor: c }]}
          />
        ))}
      </View>
      <View style={{ height: 260, overflow: 'hidden', borderRadius: 4 }}>
        <WebView
          source={{ html }}
          style={{
            flex: 1,
            transform: [{ scale: 0.55 }],
            transformOrigin: 'top left',
            width: '182%',
            height: '182%',
          }}
          scrollEnabled={false}
          pointerEvents="none"
          originWhitelist={['*']}
        />
      </View>
    </View>
    <TouchableOpacity
      style={miniStyles.overlay}
      onPress={onTap}
      activeOpacity={0.85}
    >
      <View style={miniStyles.overlayBtn}>
        <Eye size={16} color="#fff" />
        <Text style={miniStyles.overlayText}>Full Preview</Text>
      </View>
    </TouchableOpacity>
  </View>
);

const miniStyles = StyleSheet.create({
  container: {
    position: 'relative',
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  browser: { backgroundColor: '#f0f0f0', borderRadius: 10, overflow: 'hidden' },
  browserBar: {
    flexDirection: 'row',
    gap: 5,
    padding: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  browserDot: { width: 8, height: 8, borderRadius: 4 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
  },
  overlayBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overlayText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

const LayoutCard: FC<{
  layout: (typeof LAYOUTS)[0];
  selected: boolean;
  onPress: () => void;
}> = ({ layout, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.layoutCard, selected && styles.layoutCardActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <Text style={[styles.layoutIcon, selected && { color: C.primary }]}>
      {layout.icon}
    </Text>
    <View style={{ flex: 1 }}>
      <Text style={[styles.layoutName, selected && { color: C.primary }]}>
        {layout.name}
      </Text>
      <Text style={styles.layoutDesc}>{layout.desc}</Text>
    </View>
    {selected && (
      <View style={styles.layoutCheck}>
        <Check size={12} color="#fff" strokeWidth={3} />
      </View>
    )}
  </TouchableOpacity>
);

// ─── API HELPERS ──────────────────────────────────────────────────────────────
// const BASE_URL = 'https://your-api.com/api'

// async function fetchResumeFromServer(userId: string): Promise<ServerResume | null> {
//   try {
//     const res = await fetch(`${BASE_URL}/resumes/${userId}`, {
//       headers: { 'Authorization': `Bearer YOUR_TOKEN`, 'Content-Type': 'application/json' },
//     })
//     if (!res.ok) return null
//     return await res.json()
//   } catch { return null }
// }

function mapServerToLocal(server: IResumeResponse): {
  data: Partial<ResumeData>;
  layout: number;
} {
  const educations = safeParse<any[]>(server.educations, []);
  const experiences = safeParse<any[]>(server.experiences, []);
  const certifications = safeParse<any[]>(server.certifications, []);
  const skills = safeParse<string[]>(server.skills, []);
  const languages = safeParse<string[]>(server.languages, []);

  return {
    layout: Number(server.template_id ?? 0),

    data: {
      name: server.full_name ?? '',
      phone: server.phone ?? '',
      email: server.email ?? '',
      address: server.address ?? '',
      linkedin: server.linkedin ?? '',
      tagline: server.tagline ?? '',
      isFresher: server.is_fresher ?? false,
      careerObjective: server.career_objective ?? '',

      skills,
      languages,

      educations: educations.map(e => ({
        id: generateId(),
        degree: e.degree ?? '',
        school: e.school ?? '',
        gradYear: e.grad_year ?? '',
        grade: e.grade ?? '',
      })),

      experiences: experiences.map(e => ({
        id: generateId(),
        role: e.role ?? '',
        company: e.company ?? '',
        duration: e.duration ?? '',
        description: e.description ?? '',
      })),

      certifications: certifications.map(c => ({
        id: generateId(),
        name: c.name ?? '',
        org: c.org ?? '',
        year: c.year ?? '',
      })),
    },
  };
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
interface Props {
  navigation: any;
  route?: { params?: { userId?: string } };
}

const ResumeBuilderScreen: FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const userId = route?.params?.userId;
    

  async function saveResumeToServer(data: ResumeData, layoutId: number) {
    try {
      const payload: ServerResume = {
        full_name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        linkedin: data.linkedin,
        tagline: data.tagline,
        is_fresher: data.isFresher,
        career_objective: data.careerObjective,
        educations: data.educations.map(e => ({
          degree: e.degree,
          school: e.school,
          grad_year: e.gradYear,
          grade: e.grade,
        })),
        experiences: data.experiences.map(e => ({
          role: e.role,
          company: e.company,
          duration: e.duration,
          description: e.description,
        })),
        has_certifications: data.hasCert,
        certifications: data.certifications.map(c => ({
          name: c.name,
          org: c.org,
          year: c.year,
        })),
        skills: data.skills,
        languages: data.languages,
        layout_id: layoutId,
        resume_id:data?.resume_id||undefined
      };

      dispatch(
        saveResumeDataAction({
          payload,
          successCallback: () => {
            console.log("successfully called");
            
            
          },
          errorCallback: (err: any) => {
            console.log('someerror', err);
          },
        }) as any,
      );

      // const method = resumeId ? 'PUT' : 'POST'
      // const url    = resumeId ? `${BASE_URL}/resumes/${resumeId}` : `${BASE_URL}/resumes`
      // const res    = await fetch(url, {
      //   method,
      //   headers: { 'Authorization': `Bearer YOUR_TOKEN`, 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // })
      // if (!res.ok) return { ok: false }
      // const body = await res.json()
      // // Assumes API returns { id: '...' } on POST
      // return { ok: true, newId: body?.id }
    } catch {
      return { ok: false };
    }
  }

  // const userId = route?.params?.userId;

  const [step, setStep] = useState(0);
  const [layout, setLayout] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [existingResumeId, setExistingResumeId] = useState<
    string | undefined
  >();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Preview modal
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('Resume Preview');

  // Timer ref to auto-clear "saved" badge after a few seconds
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [tagline, setTagline] = useState('');

  const [educations, setEducations] = useState<Education[]>([
    { id: generateId(), degree: '', school: '', gradYear: '', grade: '' },
  ]);
  const [isFresher, setIsFresher] = useState(false);
  const [careerObjective, setCareerObjective] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: generateId(), role: '', company: '', duration: '', description: '' },
  ]);
  const [hasCert, setHasCert] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([
    { id: generateId(), name: '', org: '', year: '' },
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      dispatch(
        getResumeDataAction({
          payload: null,
          successCallback: () => {},
          errorCallback: (err: any) => {
            console.log('someerror', err);
          },
        }) as any,
      );
    }, [step]),
  );

  // Build the current resume data snapshot (used in callbacks below)
  const buildResumeData = useCallback(
    (): ResumeData => ({
      name,
      phone,
      email,
      address,
      linkedin,
      tagline,
      educations,
      isFresher,
      careerObjective,
      experiences,
      hasCert,
      certifications,
      skills,
      languages,
    }),
    [
      name,
      phone,
      email,
      address,
      linkedin,
      tagline,
      educations,
      isFresher,
      careerObjective,
      experiences,
      hasCert,
      certifications,
      skills,
      languages,
    ],
  );

  const resumeData: ResumeData = buildResumeData();
  const savedResumeData = useSelector(
    (state: StoreState) => state.job.resume_data,
  );

  //   saved Data with resume_id
  const savedResumeDataWithResumeId = async ({
    resumeData,
    resumeId,
    currentLayout,
    successCallback
  }: {
    resumeData?: ResumeData;
    resumeId?: any;
    currentLayout: number;
    successCallback?:()=>void;
  }) => {
    try{
    const token = await getToken();
    console.log('jwt token ', token);

    // if (!userId) return

    // Clear any pending "saved" hide timer
    if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    let payload = resumeData ? JSON.parse(JSON.stringify(resumeData)) : null;
    if (resumeId) payload.resume_id = resumeId;

    // setSaveStatus('saving')
    await saveResumeToServer(payload, currentLayout);
    successCallback?.();
    }catch(e){
      console.log("error in saveResumeToServer",e);
    }
  };

  // ── Auto-save helper ────────────────────────────────────────────────────────
  /**
   * Silently saves to backend. Updates saveStatus badge.
   * Does nothing if no userId (guest mode).
   */
  const autoSave = useCallback(
    async (data: ResumeData, currentLayout: number) => {
      const token = await getToken();
      console.log('jwt token ', token);

      // if (!userId) return

      // Clear any pending "saved" hide timer
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);

      // setSaveStatus('saving')
      await saveResumeToServer(data, currentLayout);

      // if (ok) {
      //   // Capture returned ID on first save so subsequent calls use PUT
      //   if (newId && !existingResumeId) setExistingResumeId(newId)
      //   setSaveStatus('saved')
      //   // Auto-hide after 3 seconds
      //   saveStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
      // } else {
      //   setSaveStatus('error')
      //   saveStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 5000)
      // }
    },
    [ existingResumeId],
  );

  // ── Fetch on mount ──────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      setIsFetching(true);
      const server = savedResumeData;
      if (server) {
        const { data, layout: l } = mapServerToLocal(server);
        if (data.name) setName(data.name);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.address) setAddress(data.address);
        if (data.linkedin) setLinkedin(data.linkedin);
        if (data.tagline) setTagline(data.tagline);
        if (data.isFresher !== undefined) setIsFresher(data.isFresher);
        if (data.careerObjective) setCareerObjective(data.careerObjective);
        if (data.educations?.length)
          setEducations(data.educations as Education[]);
        if (data.experiences?.length)
          setExperiences(data.experiences as Experience[]);
        if (data.hasCert !== undefined) setHasCert(data.hasCert);
        if (data.certifications?.length)
          setCertifications(data.certifications as Certification[]);
        if (data.skills?.length) setSkills(data.skills);
        if (data.languages?.length) setLanguages(data.languages);
        setLayout(l);
        if (server.id) setExistingResumeId(String(server.id));
      }
      setIsFetching(false);
    })();
  }, [savedResumeData]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    },
    [],
  );

  const user_details = useSelector(
    (state: StoreState) => state.auth.user_details,
  );

  // ── Keyboard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ── PDF ─────────────────────────────────────────────────────────────────────
  const generatePDF = async (): Promise<string | null> => {
    try {
      setIsGenerating(true);
      const html = generateResumeHTML(resumeData, layout);
      const file = await createPDF({
        html,
        fileName: `Resume_${name.replace(/\s+/g, '_') || 'MyResume'}`,
        directory: Platform.OS === 'android' ? 'Documents' : 'Caches',
        width: 595,
        height: 842,
      });
      console.log('file    814 >>> ', file);

      setPdfPath(file.filePath!);
      setIsGenerating(false);
      return file.filePath!;
    } catch {
      Alert.alert('Error', 'Failed to generate PDF');
      setIsGenerating(false);
      return null;
    }
  };

  const handleGenerateAndPreview = async () => {
    const path = await generatePDF();
    if (path) {
      setPreviewTitle('Generated PDF Preview');
      setPreviewVisible(true);
    }
  };

  const sharePDF = async () => {
    const path = pdfPath || (await generatePDF());
    if (!path) return;
    try {
      await Share.open({
        url: Platform.OS === 'android' ? `file://${path}` : path,
        type: 'application/pdf',
        filename: path.split('/').pop(),
      });
    } catch {}
  };

  const buildFormData = (uri: string) => {
    const fd = new FormData();

    fd.append('user_id', String(user_details?.candidate_details?.candidate_id));

    fd.append(
      'user_type',
      String(user_details?.candidate_details?.candidate_user_type || ''),
    );
    fd.append('upload_doc_type', '17');

    const cleanUri =
      Platform.OS === 'android'
        ? uri.startsWith('file://')
          ? uri
          : `file://${uri.startsWith('/') ? '' : '/'}${uri}`
        : uri.replace('file://', '');

    fd.append('doc_file', {
      uri: cleanUri,
      name: `resume_${Date.now()}.pdf`,
      type: 'application/pdf',
    } as any);

    return fd;
  };

  const uploadResumePDF = async () => {
    const path = await generatePDF();

    console.log('path >>> ', path);

    if (path) {
      const safeUri = await moveToCache(path);
      const jwtToken = await getToken();
      try {
        dispatch(
          BeginApiCallAction({
            count: 1,
            message: 'Uploading resume...',
          }) as any,
        );
        const formObj = buildFormData(safeUri);
        console.log('path >>>> 846 >>> ', safeUri);
        console.log('formObj  890 >>> ', formObj);

        const response = await fetch(
          `${baseServiceUrl}${urls.uploadDocFiles}`,
          {
            method: 'POST',
            headers: {
              Authorization: `${jwtToken}`,
              // Authorization: `Bearer ${token}`, // if needed
            },
            body: formObj,
          },
        );

        const result = await response.json();
        if (result?.Data?.doc_id) {
          savedResumeDataWithResumeId({
            resumeData: resumeData,
            resumeId: result?.Data?.doc_id,
            currentLayout: layout,
            successCallback:()=>{
              console.log("successCallback called");
              navigation?.navigate('JobApplications');
              
            }
          });
        }
        console.log('Upload success:', result);

      } catch (error) {
        console.log('Upload error:', error);
      } finally {
        dispatch(LoadingStopAction());
      }
    }
  };

  // ── Manual save (final step button) ────────────────────────────────────────
  const handleManualSave = async () => {
    await autoSave(resumeData, layout);
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goNext = useCallback(async () => {
    Keyboard.dismiss();
    if (step >= STEPS.length - 1) return;

    // ── AUTO-SAVE on Continue ──
    // Fire-and-forget: don't block navigation, badge shows status in header
    autoSave(buildResumeData(), layout);

    setStep(s => s + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [step, layout, buildResumeData, autoSave]);

  const goBack = useCallback(() => {
    Keyboard.dismiss();
    if (step > 0) {
      setStep(s => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else navigation.goBack();
  }, [step, navigation]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const addEdu = () =>
    setEducations(p => [
      ...p,
      { id: generateId(), degree: '', school: '', gradYear: '', grade: '' },
    ]);
  const removeEdu = (id: string) =>
    setEducations(p => p.filter(e => e.id !== id));
  const updateEdu = (id: string, f: keyof Education, v: string) =>
    setEducations(p => p.map(e => (e.id === id ? { ...e, [f]: v } : e)));

  const addExp = () =>
    setExperiences(p => [
      ...p,
      {
        id: generateId(),
        role: '',
        company: '',
        duration: '',
        description: '',
      },
    ]);
  const removeExp = (id: string) =>
    setExperiences(p => p.filter(e => e.id !== id));
  const updateExp = (id: string, f: keyof Experience, v: string) =>
    setExperiences(p => p.map(e => (e.id === id ? { ...e, [f]: v } : e)));

  const addCert = () =>
    setCertifications(p => [
      ...p,
      { id: generateId(), name: '', org: '', year: '' },
    ]);
  const removeCert = (id: string) =>
    setCertifications(p => p.filter(c => c.id !== id));
  const updateCert = (id: string, f: keyof Certification, v: string) =>
    setCertifications(p => p.map(c => (c.id === id ? { ...c, [f]: v } : c)));

  const currentHTML = generateResumeHTML(resumeData, layout);

  // ── Steps ───────────────────────────────────────────────────────────────────
  const STEPS = [
    {
      key: 'personal',
      label: 'Personal',
      icon: <User size={15} color={C.textSub} />,
    },
    {
      key: 'education',
      label: 'Education',
      icon: <GraduationCap size={15} color={C.textSub} />,
    },
    {
      key: 'experience',
      label: 'Experience',
      icon: <Briefcase size={15} color={C.textSub} />,
    },
    {
      key: 'certs',
      label: 'Certs',
      icon: <Award size={15} color={C.textSub} />,
    },
    {
      key: 'skills',
      label: 'Skills',
      icon: <Wrench size={15} color={C.textSub} />,
    },
    {
      key: 'layout',
      label: 'Layout',
      icon: <Palette size={15} color={C.textSub} />,
    },
    {
      key: 'preview',
      label: 'Preview',
      icon: <Eye size={15} color={C.textSub} />,
    },
  ];

  // ── Render step content ─────────────────────────────────────────────────────
  const renderContent = () => {
    switch (step) {
      // STEP 0 — Personal
      case 0:
        return (
          <View style={styles.card}>
            <SectionHeader
              icon={<User size={18} color={C.primary} />}
              title="Personal Information"
            />
            <FormField
              label="FULL NAME"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rahul Sharma"
              icon={<User size={13} color={C.textSub} />}
              returnKeyType="next"
            />
            <FormField
              label="PHONE"
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              icon={<Phone size={13} color={C.textSub} />}
              returnKeyType="next"
            />
            <FormField
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rahul@email.com"
              icon={<Mail size={13} color={C.textSub} />}
              returnKeyType="next"
            />
            <FormField
              label="ADDRESS"
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Kolkata, West Bengal"
              icon={<MapPin size={13} color={C.textSub} />}
              returnKeyType="next"
            />
          </View>
        );

      // STEP 1 — Education
      case 1:
        return (
          <View>
            {educations.map((edu, i) => (
              <View key={edu.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <SectionHeader
                    icon={<GraduationCap size={18} color={C.primary} />}
                    title={`Education ${i + 1}`}
                  />
                  {educations.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeEdu(edu.id)}
                      style={styles.removeBtn}
                    >
                      <Trash2 size={15} color={C.urgent} />
                    </TouchableOpacity>
                  )}
                </View>
                <FormField
                  label="DEGREE / COURSE"
                  value={edu.degree}
                  onChangeText={v => updateEdu(edu.id, 'degree', v)}
                  placeholder="e.g. B.Tech – Computer Science"
                  returnKeyType="next"
                />
                <FormField
                  label="INSTITUTION"
                  value={edu.school}
                  onChangeText={v => updateEdu(edu.id, 'school', v)}
                  placeholder="e.g. Jadavpur University"
                  returnKeyType="next"
                />
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <FormField
                      label="YEAR"
                      value={edu.gradYear}
                      onChangeText={v => updateEdu(edu.id, 'gradYear', v)}
                      placeholder="2022"
                      returnKeyType="next"
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <FormField
                      label="GRADE"
                      value={edu.grade}
                      onChangeText={v => updateEdu(edu.id, 'grade', v)}
                      placeholder="8.4 CGPA"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addEdu}>
              <Plus size={15} color={C.primary} />
              <Text style={styles.addBtnText}>Add Degree</Text>
            </TouchableOpacity>
          </View>
        );

      // STEP 2 — Experience
      case 2:
        return (
          <View>
            <View style={styles.card}>
              <Toggle
                value={isFresher}
                onChange={setIsFresher}
                title="I am a Fresher"
                subtitle="Career objective will replace work experience"
              />
            </View>
            {isFresher ? (
              <View style={styles.card}>
                <SectionHeader
                  icon={<Briefcase size={18} color={C.primary} />}
                  title="Career Objective"
                />
                <Text style={styles.hint}>
                  Write 2–3 sentences about your goals
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    styles.formInputMultiline,
                    { marginTop: 8 },
                  ]}
                  value={careerObjective}
                  onChangeText={setCareerObjective}
                  multiline
                  placeholder="Motivated graduate seeking to apply my skills in..."
                  placeholderTextColor={C.textMuted}
                  textAlignVertical="top"
                />
              </View>
            ) : (
              <View>
                {experiences.map((exp, i) => (
                  <View key={exp.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <SectionHeader
                        icon={<Briefcase size={18} color={C.primary} />}
                        title={`Experience ${i + 1}`}
                      />
                      {experiences.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeExp(exp.id)}
                          style={styles.removeBtn}
                        >
                          <Trash2 size={15} color={C.urgent} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <FormField
                      label="JOB TITLE"
                      value={exp.role}
                      onChangeText={v => updateExp(exp.id, 'role', v)}
                      placeholder="e.g. Junior Developer"
                      returnKeyType="next"
                    />
                    <FormField
                      label="COMPANY"
                      value={exp.company}
                      onChangeText={v => updateExp(exp.id, 'company', v)}
                      placeholder="e.g. TechCo Pvt. Ltd."
                      returnKeyType="next"
                    />
                    <FormField
                      label="DURATION"
                      value={exp.duration}
                      onChangeText={v => updateExp(exp.id, 'duration', v)}
                      placeholder="e.g. Jun 2022 – Mar 2024"
                      returnKeyType="next"
                    />
                    <FormField
                      label="DESCRIPTION"
                      value={exp.description}
                      onChangeText={v => updateExp(exp.id, 'description', v)}
                      placeholder="• Built REST APIs&#10;• Reduced load time by 40%"
                      multiline
                      returnKeyType="done"
                    />
                  </View>
                ))}
                <TouchableOpacity style={styles.addBtn} onPress={addExp}>
                  <Plus size={15} color={C.primary} />
                  <Text style={styles.addBtnText}>Add Experience</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );

      // STEP 3 — Certifications
      case 3:
        return (
          <View>
            <View style={styles.card}>
              <Toggle
                value={hasCert}
                onChange={setHasCert}
                title="I have Certifications"
                subtitle="Coursera, Google, NPTEL, etc."
              />
            </View>
            {hasCert ? (
              <View>
                {certifications.map((cert, i) => (
                  <View key={cert.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <SectionHeader
                        icon={<Award size={18} color={C.primary} />}
                        title={`Certificate ${i + 1}`}
                      />
                      {certifications.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeCert(cert.id)}
                          style={styles.removeBtn}
                        >
                          <Trash2 size={15} color={C.urgent} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <FormField
                      label="CERTIFICATE NAME"
                      value={cert.name}
                      onChangeText={v => updateCert(cert.id, 'name', v)}
                      placeholder="e.g. Full Stack Web Dev"
                      returnKeyType="next"
                    />
                    <FormField
                      label="ISSUED BY"
                      value={cert.org}
                      onChangeText={v => updateCert(cert.id, 'org', v)}
                      placeholder="e.g. Coursera / Google"
                      returnKeyType="next"
                    />
                    <FormField
                      label="YEAR"
                      value={cert.year}
                      onChangeText={v => updateCert(cert.id, 'year', v)}
                      placeholder="e.g. 2023"
                      returnKeyType="done"
                    />
                  </View>
                ))}
                <TouchableOpacity style={styles.addBtn} onPress={addCert}>
                  <Plus size={15} color={C.primary} />
                  <Text style={styles.addBtnText}>Add Certificate</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.card,
                  { alignItems: 'center', paddingVertical: 32 },
                ]}
              >
                <Text style={{ fontSize: 36, marginBottom: 10 }}>📄</Text>
                <Text
                  style={{ fontSize: 14, fontWeight: '700', color: C.text }}
                >
                  No certifications?
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: C.textSub,
                    textAlign: 'center',
                    marginTop: 4,
                  }}
                >
                  Your education and skills will still shine.
                </Text>
              </View>
            )}
          </View>
        );

      // STEP 4 — Skills & Languages
      case 4:
        return (
          <View>
            <View style={styles.card}>
              <SectionHeader
                icon={<Wrench size={18} color={C.primary} />}
                title="Technical Skills"
              />
              <Text style={styles.hint}>Type a skill and tap + to add</Text>
              <View style={{ marginTop: 10 }}>
                <ChipInput
                  chips={skills}
                  onChipsChange={setSkills}
                  placeholder="e.g. React Native"
                />
              </View>
            </View>
            <View style={styles.card}>
              <SectionHeader
                icon={<Sparkles size={18} color={C.primary} />}
                title="Languages"
              />
              <Text style={styles.hint}>Languages you communicate in</Text>
              <View style={{ marginTop: 10 }}>
                <ChipInput
                  chips={languages}
                  onChipsChange={setLanguages}
                  placeholder="e.g. Bengali, English"
                />
              </View>
            </View>
          </View>
        );

      // STEP 5 — Layout + LIVE PREVIEW
      case 5:
        return (
          <View style={styles.card}>
            <SectionHeader
              icon={<Palette size={18} color={C.primary} />}
              title="Resume Layout"
            />
            <Text style={[styles.hint, { marginBottom: 14 }]}>
              All layouts use black & white — choose your structure
            </Text>

            {LAYOUTS.map(l => (
              <LayoutCard
                key={l.id}
                layout={l}
                selected={layout === l.id}
                onPress={() => setLayout(l.id)}
              />
            ))}

            <View style={layoutPreviewStyles.sectionDivider}>
              <View style={layoutPreviewStyles.dividerLine} />
              <Text style={layoutPreviewStyles.dividerLabel}>LIVE PREVIEW</Text>
              <View style={layoutPreviewStyles.dividerLine} />
            </View>

            <MiniPreview
              html={currentHTML}
              onTap={() => {
                setPreviewTitle(`${LAYOUTS[layout].name} Layout Preview`);
                setPreviewVisible(true);
              }}
            />

            <View style={styles.previewStrip}>
              <Text style={styles.previewStripLabel}>
                Selected:{' '}
                <Text style={{ color: C.primary, fontWeight: '800' }}>
                  {LAYOUTS[layout].name}
                </Text>
              </Text>
              <Text style={styles.previewStripSub}>B&W resume · PDF ready</Text>
            </View>
          </View>
        );

      // STEP 6 — Final preview & actions
      case 6:
        return (
          <View>
            {/* Completeness check */}
            <View style={styles.card}>
              <SectionHeader
                icon={<Check size={18} color={C.primary} />}
                title="Completeness Check"
              />
              {(
                [
                  ['Personal info', !!(name && phone && email)],
                  ['Education', educations.some(e => e.degree && e.school)],
                  [
                    isFresher ? 'Career objective' : 'Work experience',
                    isFresher
                      ? !!careerObjective
                      : experiences.some(e => e.role && e.company),
                  ],
                  [
                    'Certifications',
                    !hasCert || certifications.some(c => c.name),
                  ],
                  ['Skills (min 3)', skills.length >= 3],
                ] as [string, boolean][]
              ).map(([label, ok]) => (
                <View key={label} style={styles.checkRow}>
                  <View
                    style={[
                      styles.checkDot,
                      { backgroundColor: ok ? C.success : C.border },
                    ]}
                  >
                    {ok && <Check size={10} color="#fff" strokeWidth={3} />}
                  </View>
                  <Text
                    style={[
                      styles.checkLabel,
                      { color: ok ? C.text : C.textMuted },
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Live preview thumbnail */}
            <View style={styles.card}>
              <SectionHeader
                icon={<Eye size={18} color={C.primary} />}
                title="Resume Preview"
              />
              <MiniPreview
                html={currentHTML}
                onTap={() => {
                  setPreviewTitle('Resume Preview');
                  setPreviewVisible(true);
                }}
              />
            </View>

            {/* Actions */}
            <View style={styles.actionGrid}>
              {/* <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.primary }]} onPress={handleGenerateAndPreview} disabled={isGenerating}>
              {isGenerating
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Eye size={18} color="#fff" /><Text style={styles.actionBtnText}>Preview PDF</Text></>
              }
            </TouchableOpacity> */}
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: '#374151', marginTop: 20 },
                ]}
                onPress={uploadResumePDF}
                disabled={isGenerating}
              >
                <Upload size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Upload</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0891B2' }]} onPress={sharePDF} disabled={isGenerating}>
              <Share2 size={18} color="#fff" /><Text style={styles.actionBtnText}>Share PDF</Text>
            </TouchableOpacity> */}
              {userId && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#059669' }]}
                  onPress={handleManualSave}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Save size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>
                        {existingResumeId ? 'Update' : 'Save'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* {pdfPath && (
            <View style={[styles.card, { backgroundColor: C.successBg, borderColor: C.successMid, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
              <FileText size={20} color={C.success} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>PDF Ready!</Text>
                <Text style={{ fontSize: 11, color: C.textMuted }} numberOfLines={1}>{pdfPath}</Text>
              </View>
              <TouchableOpacity onPress={() => { setPreviewTitle('Generated PDF Preview'); setPreviewVisible(true) }} style={{ padding: 4 }}>
                <Eye size={18} color={C.success} />
              </TouchableOpacity>
            </View>
          )} */}
          </View>
        );
    }
  };

  const NAV_HEIGHT = Platform.OS === 'ios' ? 84 : 72;
  const scrollPadding = NAV_HEIGHT + keyboardHeight + 20;

  if (isFetching) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.bg,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ color: C.textSub, fontSize: 14 }}>
          Loading your resume…
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Full preview modal */}
      <ResumePreviewModal
        visible={previewVisible}
        html={currentHTML}
        title={previewTitle}
        onClose={() => setPreviewVisible(false)}
        onDownload={uploadResumePDF}
        onShare={sharePDF}
        isGenerating={isGenerating}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={goBack}>
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Resume Builder</Text>
          <Text style={styles.headerSub}>
            Step {step + 1} of {STEPS.length} · {STEPS[step].label}
          </Text>
        </View>
        {/* Save status badge in header (only when userId exists) */}
        {userId && saveStatus !== 'idle' && (
          <View style={{ marginRight: 8 }}>
            <SaveBadge status={saveStatus} />
          </View>
        )}
        {/* Quick preview button */}
        <TouchableOpacity
          style={[
            styles.headerBadge,
            {
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            },
          ]}
          onPress={() => {
            setPreviewTitle('Resume Preview');
            setPreviewVisible(true);
          }}
        >
          <Eye size={13} color="#fff" />
          <Text style={styles.headerBadgeText}>Preview</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((step + 1) / STEPS.length) * 100}%` },
          ]}
        />
      </View>

      {/* Step tab strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabStrip}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {STEPS.map((st, i) => (
          <TouchableOpacity
            key={st.key}
            style={[styles.tab, step === i && styles.tabActive]}
            onPress={() => {
              Keyboard.dismiss();
              setStep(i);
              scrollRef.current?.scrollTo({ y: 0, animated: true });
            }}
          >
            <View
              style={[
                styles.tabDot,
                step > i && styles.tabDotDone,
                step === i && styles.tabDotActive,
              ]}
            >
              {step > i ? (
                <Check size={9} color="#fff" strokeWidth={3} />
              ) : (
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: '800',
                    color: step === i ? '#fff' : C.textMuted,
                  }}
                >
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              style={[styles.tabLabel, step === i && styles.tabLabelActive]}
            >
              {st.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={{ padding: 16, paddingBottom: scrollPadding }}
      >
        {renderContent()}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        {step > 0 ? (
          <TouchableOpacity style={styles.navBack} onPress={goBack}>
            <Text style={styles.navBackText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 72 }} />
        )}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={styles.navNext}
            onPress={goNext}
            disabled={saveStatus === 'saving'}
          >
            <Text style={styles.navNextText}>Continue</Text>
            <ChevronRight size={17} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 120 }} />
        )}
      </View>
    </View>
  );
};

const layoutPreviewStyles = StyleSheet.create({
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#999',
  },
});

export default ResumeBuilderScreen;
