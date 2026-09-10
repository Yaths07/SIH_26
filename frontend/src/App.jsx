import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  ShieldAlert,
  PlusCircle,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  Activity,
  Database,
  RefreshCw,
  LayoutDashboard,
  Eye,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  X,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  User,
  CheckCircle,
  FileText,
  Zap,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Backend & Form State
  const [records, setRecords] = useState([]);
  const [fetchingRecords, setFetchingRecords] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  // Proposal Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Infrastructure',
    sanctioned_amount: '',
    estimated_duration_months: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');

  const categories = ['Infrastructure', 'Education', 'Health', 'Water & Sanitation', 'Roads & Bridges', 'Other'];

  // Fetch past records
  const fetchRecords = async () => {
    setFetchingRecords(true);
    try {
      const response = await axios.get('/projects');
      const data = response.data.data || response.data || [];
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setFetchingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Form Handlers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      ...formData,
      sanctioned_amount: parseFloat(formData.sanctioned_amount),
      estimated_duration_months: parseInt(formData.estimated_duration_months, 10)
    };

    try {
      const response = await axios.post('/analyze-project', payload);     
      setResult(response.data);
      fetchRecords(); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze project. Make sure FastAPI server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Helper Calculations
  const metrics = useMemo(() => {
    const total = records.length;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;
    let totalAllocated = 0;

    records.forEach((r) => {
      const score = r.risk_score || (r.is_fraud ? 75 : 20);
      const amount = parseFloat(r.sanctioned_amount) || 0;
      totalAllocated += amount;

      if (score >= 80) critical++;
      else if (score >= 60 || r.is_fraud) high++;
      else if (score >= 35) medium++;
      else low++;
    });

    return {
      total,
      critical,
      high,
      medium,
      low,
      totalAllocatedCr: (totalAllocated / 10000000).toFixed(2),
      avgUtilization: 68.4
    };
  }, [records]);

  // Filtered List
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.location && r.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.category && r.category.toLowerCase().includes(searchTerm.toLowerCase()));

      const score = r.risk_score || (r.is_fraud ? 70 : 20);
      let matchesRisk = true;
      if (riskFilter === 'CRITICAL') matchesRisk = score >= 80;
      else if (riskFilter === 'HIGH') matchesRisk = score >= 60 && score < 80;
      else if (riskFilter === 'MEDIUM') matchesRisk = score >= 35 && score < 60;
      else if (riskFilter === 'LOW') matchesRisk = score < 35;

      const matchesState = stateFilter === 'ALL' || (r.location && r.location.toLowerCase().includes(stateFilter.toLowerCase()));

      return matchesSearch && matchesRisk && matchesState;
    });
  }, [records, searchTerm, riskFilter, stateFilter]);

  const highRiskAlerts = useMemo(() => {
    return records.filter((r) => (r.risk_score || (r.is_fraud ? 70 : 20)) >= 60);
  }, [records]);

  const stateOptions = useMemo(() => {
    const states = new Set(records.map((r) => r.location).filter(Boolean));
    return Array.from(states).slice(0, 15);
  }, [records]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 flex font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-sm z-20">
        <div>
          {/* Logo Branding */}
          <div className="p-5 border-b border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wider text-[#0a2351]">DRISHTI</h1>
              <p className="text-[10px] uppercase font-semibold text-blue-600 tracking-widest">Risk Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'monitor', label: 'Risk Monitor', icon: ShieldAlert },
              { id: 'constituencies', label: 'Constituencies', icon: MapPin },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: highRiskAlerts.length },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'new_proposal', label: 'Submit Proposal', icon: PlusCircle, highlight: true }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    item.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-md shadow-blue-600/20'
                      : isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Status */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-green-700 font-mono bg-green-100 border border-green-200 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="font-semibold">AI MONITORING ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navigation Header */}
        <header className="border-b border-gray-200 bg-white/90 backdrop-blur px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-blue-600 font-semibold">DRISHTI</span> / <span>MPLADS Risk Intelligence System</span>
            </div>
            <h2 className="text-xl font-bold text-[#0a2351] capitalize mt-0.5">
              {activeTab === 'new_proposal' ? 'New Proposal Anomaly Audit' : activeTab.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRecords}
              className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${fetchingRecords ? 'animate-spin' : ''}`} /> Refresh Dataset
            </button>
            <span className="text-xs text-gray-600 font-medium border border-gray-200 px-3 py-2 rounded-lg bg-gray-50">
              Govt of India • MoSPI
            </span>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase mb-2">
                    <span>Records Analyzed</span>
                    <Database className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">{metrics.total}</div>
                </div>

                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase mb-2">
                    <span>Allocated Funds</span>
                    <IndianRupee className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900">₹{metrics.totalAllocatedCr} Cr</div>
                </div>

                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase mb-2">
                    <span>Critical Cases</span>
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-red-600">{metrics.critical}</div>
                </div>

                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase mb-2">
                    <span>High Risk</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-600">{metrics.high}</div>
                </div>

                <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase mb-2">
                    <span>Avg Utilization</span>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-blue-600">{metrics.avgUtilization}%</div>
                </div>
              </div>

              {/* Risk Distribution & How DRISHTI Works */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Risk Breakdown Card */}
                <div className="lg:col-span-4 bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                  <h3 className="font-semibold text-[#0a2351] mb-4">Risk Distribution</h3>
                  <div className="flex items-center justify-center my-6">
                    <div className="relative w-44 h-44 rounded-full border-[10px] border-green-100 border-t-red-500 border-r-amber-500 border-b-blue-500 flex flex-col items-center justify-center bg-gray-50 shadow-inner">
                      <span className="text-3xl font-bold text-gray-900">{metrics.total}</span>
                      <span className="text-xs text-gray-500 font-medium">Total Records</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span><span className="text-gray-500">Critical:</span><strong className="text-gray-900">{metrics.critical}</strong></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-gray-500">High:</span><strong className="text-gray-900">{metrics.high}</strong></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span><span className="text-gray-500">Medium:</span><strong className="text-gray-900">{metrics.medium}</strong></div>
                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span><span className="text-gray-500">Low:</span><strong className="text-gray-900">{metrics.low}</strong></div>
                  </div>
                </div>

                {/* DRISHTI Process Flow */}
                <div className="lg:col-span-8 bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[#0a2351] mb-4">How DRISHTI Works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center my-4">
                      {[
                        { title: 'Ingest', desc: 'MPLADS allocation & data', icon: Database },
                        { title: 'Analyze', desc: 'AI/ML financial patterns', icon: Activity },
                        { title: 'Detect', desc: 'Identifies anomalies', icon: Search },
                        { title: 'Prioritize', desc: 'Generates risk scores', icon: Zap },
                        { title: 'Act', desc: 'Authorities investigate', icon: ShieldAlert }
                      ].map((step, idx) => {
                        const StepIcon = step.icon;
                        return (
                          <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-sm">
                              <StepIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-900">{step.title}</span>
                            <span className="text-[10px] text-gray-500 mt-1 leading-tight">{step.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-xs flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Prototype Intelligence — ML indicators run in real-time. Click any record in Risk Monitor for deep audit inspection.</span>
                  </div>
                </div>
              </div>

              {/* Highest Risk Table Preview */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-[#0a2351]">Highest Risk Flagged Cases</h3>
                  <button onClick={() => setActiveTab('monitor')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#eef8ff] text-[#0a2351] uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-3.5">Risk Score</th>
                        <th className="p-3.5">Project / Ward</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Risk Level</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.slice(0, 5).map((item) => {
                        const score = item.risk_score || (item.is_fraud ? 75 : 20);
                        return (
                          <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-md font-bold font-mono ${score >= 60 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {score}
                              </span>
                            </td>
                            <td className="p-3.5 font-semibold text-gray-900">{item.title}</td>
                            <td className="p-3.5 text-gray-600">{item.category}</td>
                            <td className="p-3.5 text-gray-800 font-mono font-medium">₹{Number(item.sanctioned_amount).toLocaleString('en-IN')}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${item.is_fraud ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                {item.is_fraud ? 'High Risk' : 'Low Risk'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button onClick={() => setSelectedProject(item)} className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-200 underline-offset-2">
                                Audit Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: RISK MONITOR */}
          {activeTab === 'monitor' && (
            <div className="space-y-6">
              {/* Search & Filter Controls */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by project title, constituency, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-gray-900"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-semibold text-xs uppercase">Risk Level:</span>
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRiskFilter(lvl)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all shadow-sm ${
                          riskFilter === lvl
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-semibold text-xs uppercase">Location Filter:</span>
                    <select
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="ALL">All Locations</option>
                      {stateOptions.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Comprehensive Records Table */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 text-xs text-gray-500 flex justify-between items-center bg-gray-50">
                  <span>Showing <strong className="text-gray-900">{filteredRecords.length}</strong> of {records.length} records</span>
                  <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5"/> Click any row to open full AI Risk Assessment</span>
                </div>
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#eef8ff] text-[#0a2351] uppercase font-semibold sticky top-0 border-b border-gray-200 shadow-sm z-10">
                      <tr>
                        <th className="p-3.5">Risk Level</th>
                        <th className="p-3.5">Project Title</th>
                        <th className="p-3.5">Location / Ward</th>
                        <th className="p-3.5">Sanctioned Amount</th>
                        <th className="p-3.5">Duration</th>
                        <th className="p-3.5">Main Indicator</th>
                        <th className="p-3.5 text-center">Score</th>
                        <th className="p-3.5 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {fetchingRecords ? (
                        <tr>
                          <td colSpan="8" className="text-center py-12 text-gray-500">Loading dataset...</td>
                        </tr>
                      ) : filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center py-12 text-gray-500">No matching projects found.</td>
                        </tr>
                      ) : (
                        filteredRecords.map((item) => {
                          const score = item.risk_score || (item.is_fraud ? 75 : 20);
                          return (
                            <tr
                              key={item.id}
                              onClick={() => setSelectedProject(item)}
                              className="hover:bg-blue-50/60 cursor-pointer transition-colors group"
                            >
                              <td className="p-3.5">
                                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase border ${
                                  score >= 60
                                    ? 'bg-red-50 text-red-600 border-red-200'
                                    : 'bg-green-50 text-green-600 border-green-200'
                                }`}>
                                  {score >= 60 ? 'HIGH' : 'LOW'}
                                </span>
                              </td>
                              <td className="p-3.5 font-semibold text-gray-900">{item.title}</td>
                              <td className="p-3.5 text-gray-600">{item.location}</td>
                              <td className="p-3.5 font-mono text-gray-800 font-medium">₹{Number(item.sanctioned_amount).toLocaleString('en-IN')}</td>
                              <td className="p-3.5 text-gray-600">{item.estimated_duration_months} Months</td>
                              <td className="p-3.5 text-amber-600 font-medium">
                                {item.is_fraud ? 'Cost & Duration Anomaly' : 'Standard Baseline'}
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                                  score >= 60 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {score}
                                </span>
                              </td>
                              <td className="p-3.5 text-right text-blue-600 group-hover:text-blue-800 transition-colors">
                                <ChevronRight className="w-4 h-4 ml-auto" />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONSTITUENCIES */}
          {activeTab === 'constituencies' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.slice(0, 12).map((item, idx) => {
                  const score = item.risk_score || (item.is_fraud ? 70 : 20);
                  return (
                    <div key={idx} className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 space-y-4 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-[#0a2351] text-base">{item.location || 'Ward Region'}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md font-bold font-mono text-xs ${score >= 60 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {score}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div>
                          <span className="text-gray-500 block text-[10px] font-semibold uppercase mb-0.5">Allocated</span>
                          <span className="font-mono text-gray-900 font-bold">₹{(item.sanctioned_amount / 100000).toFixed(1)} Lakh</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] font-semibold uppercase mb-0.5">Est. Duration</span>
                          <span className="text-gray-900 font-bold">{item.estimated_duration_months} Mos</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.is_fraud ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                          {item.is_fraud ? 'Progress Mismatch' : 'Optimal Status'}
                        </span>
                        <button onClick={() => setSelectedProject(item)} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                          Inspect <ChevronRight className="w-3 h-3"/>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl text-sm text-gray-700 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Showing High & Critical risk cases requiring immediate audit verification.
                </span>
                <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">{highRiskAlerts.length} Active Alerts</span>
              </div>

              <div className="space-y-3">
                {highRiskAlerts.map((item) => (
                  <div key={item.id} className="bg-white border border-red-200 shadow-sm rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">High Risk Trigger</span>
                        <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5"/> {item.location} <span className="text-gray-300">|</span> 
                        <IndianRupee className="w-3.5 h-3.5"/> ₹{Number(item.sanctioned_amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProject(item)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shrink-0 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5"/> Investigate Case
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl space-y-6">
                <h3 className="font-semibold text-[#0a2351] border-b border-gray-100 pb-3">Allocation & Risk Breakdown</h3>
                <div className="space-y-4">
                  {records.slice(0, 6).map((r, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-700 font-medium">
                        <span className="truncate w-3/4">{r.title}</span>
                        <span className="font-mono font-bold">₹{(r.sanctioned_amount / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full ${r.is_fraud ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(r.risk_score || (r.is_fraud ? 80 : 25), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-xl space-y-6">
                <h3 className="font-semibold text-[#0a2351] border-b border-gray-100 pb-3">State Risk Metrics</h3>
                <div className="space-y-3">
                  {stateOptions.slice(0, 6).map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg text-sm border border-gray-200 hover:bg-blue-50 transition-colors">
                      <span className="font-semibold text-gray-800">{st}</span>
                      <span className="text-green-600 font-mono text-xs font-bold bg-green-100 px-2.5 py-1 rounded-md">Normal Range</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NEW PROPOSAL SUBMISSION */}
          {activeTab === 'new_proposal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Proposal Form */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-[#0a2351] border-b border-gray-100 pb-4">
                  <PlusCircle className="w-5 h-5 text-blue-600" /> Submit New Proposal for Real-time ML Audit
                </h3>

                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Project Title</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Construction of Community Center"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Location / Ward</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="location"
                          required
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g. Ward 12, Patna"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Sanctioned Amount (₹)</label>
                      <div className="relative">
                        <IndianRupee className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="number"
                          name="sanctioned_amount"
                          required
                          value={formData.sanctioned_amount}
                          onChange={handleInputChange}
                          placeholder="25000000"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Estimated Duration (Months)</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="number"
                          name="estimated_duration_months"
                          required
                          value={formData.estimated_duration_months}
                          onChange={handleInputChange}
                          placeholder="36"
                          className="w-full bg-gray-50 border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md text-sm"
                  >
                    {loading ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" /> Analyzing via FastAPI IsolationForest...
                      </>
                    ) : (
                      'Run ML Anomaly Audit'
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}
              </div>

              {/* Audit Result Box */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-[#0a2351] border-b border-gray-100 pb-4">
                    <Activity className="w-5 h-5 text-green-600" /> Live ML Engine Result
                  </h3>

                  {!result && !loading && (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
                      <ShieldAlert className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium">Fill out proposal form to trigger ML model.</p>
                      <p className="text-xs mt-2">Results will appear here instantly.</p>
                    </div>
                  )}

                  {loading && (
                    <div className="h-64 flex flex-col items-center justify-center text-blue-600 gap-3 border border-blue-100 bg-blue-50/50 rounded-xl">
                      <Activity className="w-10 h-10 animate-spin" />
                      <p className="text-sm font-semibold animate-pulse">Computing IsolationForest risk score...</p>
                    </div>
                  )}

                  {result && (
                    <div className="space-y-5">
                      <div className={`p-5 rounded-xl border flex items-start gap-4 ${
                        result.is_fraud ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
                      }`}>
                        {result.is_fraud ? <AlertTriangle className="w-7 h-7 shrink-0 text-red-600 mt-1" /> : <CheckCircle className="w-7 h-7 shrink-0 text-green-600 mt-1" />}
                        <div>
                          <h4 className="font-extrabold text-base mb-1">{result.is_fraud ? 'ANOMALY DETECTED' : 'STANDARD PROJECT'}</h4>
                          <p className="text-xs font-medium opacity-90 leading-relaxed">{result.flag_reason}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-gray-600 uppercase tracking-wide">Risk Score</span>
                          <span className={`font-mono text-lg ${result.is_fraud ? 'text-red-600' : 'text-green-600'}`}>
                            {result.risk_score} / 100
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full rounded-full transition-all duration-1000 ${result.is_fraud ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(result.risk_score, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="pt-5 mt-5 border-t border-gray-200 text-xs text-gray-500 flex justify-between font-medium">
                    <span>Database: <strong className="text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Supabase Connected</strong></span>
                    <span>ID: #{result.data?.[0]?.id || 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. INTERACTIVE SIDE DRAWER (AI RISK ASSESSMENT) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white border-l border-gray-200 h-full p-8 overflow-y-auto space-y-8 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="space-y-8">
              {/* Drawer Header */}
              <div className="flex justify-between items-start border-b border-gray-200 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-bold mb-2 tracking-wide uppercase bg-blue-50 w-fit px-2.5 py-1 rounded-md border border-blue-100">
                    <ShieldAlert className="w-3.5 h-3.5" /> AI RISK ASSESSMENT
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0a2351] leading-tight">{selectedProject.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{selectedProject.location} • {selectedProject.category}</p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Financial Indicators */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Financial Indicators</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Sanctioned Amount</span>
                    <span className="font-mono font-extrabold text-gray-900 text-base">₹{Number(selectedProject.sanctioned_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Estimated Duration</span>
                    <span className="font-bold text-gray-900 text-base">{selectedProject.estimated_duration_months} Months</span>
                  </div>
                </div>
              </div>

              {/* Anomaly Factor Bars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Why Was This Flagged?</h4>
                <div className="space-y-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-700">Cost Anomaly</span>
                      <span className="font-mono text-red-600">{selectedProject.is_fraud ? '75/100' : '20/100'}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${selectedProject.is_fraud ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: selectedProject.is_fraud ? '75%' : '20%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-700">Duration Mismatch</span>
                      <span className="font-mono text-amber-500">{selectedProject.is_fraud ? '85/100' : '15/100'}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${selectedProject.is_fraud ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: selectedProject.is_fraud ? '85%' : '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Findings */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">AI Findings</h4>
                <div className={`p-4 border rounded-xl text-sm space-y-2 shadow-sm ${selectedProject.is_fraud ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                  <div className="font-bold flex items-center gap-2">
                    {selectedProject.is_fraud ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {selectedProject.is_fraud ? 'Anomaly Indicator Triggered' : 'Normal Execution Expected'}
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {selectedProject.is_fraud
                      ? 'Sanctioned budget vs estimated timeline deviates significantly from historical baseline distributions.'
                      : 'Project parameters fall within expected standard limits.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={() => {
                  alert(`Project #${selectedProject.id} marked for ground verification!`);
                  setSelectedProject(null);
                }}
                className="w-full bg-[#0a2351] hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md flex justify-center items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Mark for District Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}