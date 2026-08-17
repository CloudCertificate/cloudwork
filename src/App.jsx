import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import StartPage from './pages/StartPage.jsx'
import StudyPage from './pages/StudyPage.jsx'
import ExamPage from './pages/ExamPage.jsx'
import ExamResultPage from './pages/ExamResultPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

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
