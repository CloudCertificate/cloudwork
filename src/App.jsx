import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import LoginPage from './pages/login/LoginPage.jsx'
import StartPage from './pages/start/StartPage.jsx'
import StudyPage from './pages/study/StudyPage.jsx'
import ExamPage from './pages/exam/ExamPage.jsx'
import ExamResultPage from './pages/exam-result/ExamResultPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'

export default function App() {
  return (
    <Routes>
      {/* 로그인 화면에는 사이드바가 없다 */}
      <Route path="/login" element={<LoginPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<StartPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/exam/result" element={<ExamResultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
