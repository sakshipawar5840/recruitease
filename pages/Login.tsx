import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Role } from '../types';
import { Button, Input, Select, Checkbox } from '../components/UI';
import { Eye, EyeOff, Upload, User, Building2, GraduationCap, CheckCircle, X, Moon, Sun, FileText } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, register, toggleTheme, darkMode } = useStore();
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Refs for file inputs to ensure reliable opening of file dialog
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '', role: Role.STUDENT });
  const [showPassword, setShowPassword] = useState(false);

  // Registration State
  const [regRole, setRegRole] = useState<Role>(Role.STUDENT);
  const [regData, setRegData] = useState<any>({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    department: '', yearOfPassing: '', skills: '', location: '',
    githubUrl: '', linkedinUrl: '',
    companyName: '', companyWebsite: '', companyAddress: '', logo: '',
    resumeName: '' // To track selected file name
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = login(loginData.email, loginData.password, loginData.role);
    if (!result.success) {
      setError(result.message || 'Login failed');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regData.password !== regData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Prepare User Object based on Role
    const newUser = {
      name: regData.name,
      email: regData.email,
      password: regData.password,
      role: regRole,
      phone: regData.phone,
      location: regData.companyAddress || regData.location, // Mapping address
    };

    if (regRole === Role.STUDENT) {
      Object.assign(newUser, {
        department: regData.department,
        yearOfPassing: regData.yearOfPassing,
        skills: regData.skills.split(',').map((s: string) => s.trim()),
        resumeUrl: regData.resumeName ? `uploads/${regData.resumeName}` : 'mock_resume.pdf',
        githubUrl: regData.githubUrl,
        linkedinUrl: regData.linkedinUrl
      });
    } else if (regRole === Role.HR) {
      Object.assign(newUser, {
        companyName: regData.companyName,
        companyWebsite: regData.companyWebsite,
        avatar: regData.logo // Use logo as avatar for simplicity in mock
      });
    }

    register(newUser);
    
    if (regRole === Role.HR) {
        setSuccessMsg("Registration successful! Your account is pending Admin approval.");
    } else {
        setSuccessMsg("Registration successful! Please login.");
    }
    // Switch to Login View after successful registration
    setIsLoginView(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegData((prev: any) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setRegData((prev: any) => ({ ...prev, resumeName: file.name }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-slate-800 text-gray-800 dark:text-yellow-400 shadow-lg border dark:border-gray-700 hover:scale-110 transition-transform"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden min-h-[600px] border border-gray-100 dark:border-gray-700">
        
        {/* Left Side: Visuals */}
        <div className="hidden md:flex flex-col justify-center items-center w-5/12 bg-gradient-to-br from-indigo-600 to-blue-500 dark:from-slate-800 dark:to-slate-900 text-white p-12 relative overflow-hidden transition-colors duration-500">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          {/* Decorative Circle "Half Moon" Effect */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-40 h-40 bg-white dark:bg-slate-800 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 text-center">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/10">
                 <Building2 size={40} className="text-white" />
             </div>
             <h1 className="text-4xl font-bold mb-4 tracking-tight">RecruitEase</h1>
             <p className="text-lg opacity-90 font-light mb-8 text-indigo-100 dark:text-slate-300">
               Bridging the gap between talent and opportunity. The smart way to hire.
             </p>
             <div className="flex gap-4 justify-center text-sm opacity-75 text-indigo-100 dark:text-slate-400">
                <span className="flex items-center gap-1"><User size={14}/> 500+ Students</span>
                <span className="flex items-center gap-1"><Building2 size={14}/> 50+ Companies</span>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto max-h-[90vh] bg-white dark:bg-slate-800 transition-colors duration-300">
          <div className="max-w-md mx-auto">
             <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                 {isLoginView ? 'Welcome Back' : 'Create Account'}
               </h2>
               <p className="text-gray-500 dark:text-gray-400 text-sm">
                 {isLoginView ? 'Enter your credentials to access your account' : 'Fill in your details to get started'}
               </p>
             </div>

             {/* Error/Success Messages */}
             {error && (
               <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                 <X size={16}/> {error}
               </div>
             )}
             {successMsg && (
               <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-300 text-sm rounded-lg flex items-center gap-2">
                 <CheckCircle size={16}/> {successMsg}
               </div>
             )}

             {isLoginView ? (
               /* LOGIN FORM */
               <form onSubmit={handleLogin} className="space-y-4">
                 <Select 
                    label="I am a..."
                    value={loginData.role}
                    onChange={e => setLoginData({...loginData, role: e.target.value as Role})}
                 >
                    <option value={Role.STUDENT}>Student</option>
                    <option value={Role.HR}>HR Professional</option>
                    <option value={Role.ADMIN}>Administrator</option>
                 </Select>

                 <Input 
                   label="Email Address" 
                   type="email" 
                   value={loginData.email} 
                   onChange={e => setLoginData({...loginData, email: e.target.value})}
                   required
                 />

                 <Input 
                    label="Password" 
                    type={showPassword ? "text" : "password"}
                    value={loginData.password} 
                    onChange={e => setLoginData({...loginData, password: e.target.value})}
                    icon={showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    onIconClick={() => setShowPassword(!showPassword)}
                    required
                 />

                 <div className="flex justify-between items-center text-sm">
                    <Checkbox label="Remember me" />
                    <button type="button" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Forgot Password?</button>
                 </div>

                 <Button type="submit" className="w-full py-3 text-lg shadow-lg shadow-indigo-200 dark:shadow-none">Login</Button>
                 
                 <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                   Don't have an account? <button type="button" onClick={() => setIsLoginView(false)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Register</button>
                 </div>
               </form>
             ) : (
               /* REGISTER FORM */
               <div>
                  {/* Role Tabs */}
                  <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mb-6">
                    <button 
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${regRole === Role.STUDENT ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      onClick={() => setRegRole(Role.STUDENT)}
                    >
                      Student
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${regRole === Role.HR ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                      onClick={() => setRegRole(Role.HR)}
                    >
                      HR / Company
                    </button>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                     {/* Common Fields */}
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Full Name" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} required />
                        <Input label="Phone" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} required />
                     </div>
                     <Input label="Email Address" type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} required />
                     
                     <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Password" 
                            type="password" 
                            value={regData.password} 
                            onChange={e => setRegData({...regData, password: e.target.value})} 
                            required 
                        />
                        <Input 
                            label="Confirm Pass" 
                            type="password" 
                            value={regData.confirmPassword} 
                            onChange={e => setRegData({...regData, confirmPassword: e.target.value})} 
                            required 
                        />
                     </div>

                     {/* Student Specific */}
                     {regRole === Role.STUDENT && (
                       <>
                         <div className="grid grid-cols-2 gap-4">
                           <Select label="Domain" value={regData.department} onChange={e => setRegData({...regData, department: e.target.value})}>
                              <option value="">Select Domain</option>
                              <option>Computer Science</option>
                              <option>Information Technology</option>
                              <option>Mechanical</option>
                              <option>Civil</option>
                              <option>Electronics</option>
                           </Select>
                           <Input label="Year of Passing" type="number" value={regData.yearOfPassing} onChange={e => setRegData({...regData, yearOfPassing: e.target.value})} required />
                         </div>
                         <Input label="Skills (comma separated)" placeholder="Java, React, SQL..." value={regData.skills} onChange={e => setRegData({...regData, skills: e.target.value})} required />
                         <Input label="Preferred Location" value={regData.location} onChange={e => setRegData({...regData, location: e.target.value})} />
                         
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="GitHub Profile URL" placeholder="https://github.com/..." value={regData.githubUrl} onChange={e => setRegData({...regData, githubUrl: e.target.value})} />
                            <Input label="LinkedIn Profile URL" placeholder="https://linkedin.com/in/..." value={regData.linkedinUrl} onChange={e => setRegData({...regData, linkedinUrl: e.target.value})} />
                         </div>

                         <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                            <GraduationCap size={24} className="mx-auto text-gray-400 mb-2"/>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload Resume</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">PDF or Word (Max 5MB)</p>
                            
                            <button 
                                type="button"
                                onClick={() => resumeInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <Upload size={16} />
                                Browse Files
                            </button>
                            <input 
                                ref={resumeInputRef}
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                className="hidden" 
                                onChange={handleResumeChange}
                            />
                            
                            {regData.resumeName && (
                                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 py-2 px-3 rounded-lg inline-flex">
                                    <FileText size={16} />
                                    {regData.resumeName}
                                </div>
                            )}
                         </div>
                       </>
                     )}

                     {/* HR Specific */}
                     {regRole === Role.HR && (
                        <>
                           <Input label="Company Name" value={regData.companyName} onChange={e => setRegData({...regData, companyName: e.target.value})} required />
                           <div className="grid grid-cols-2 gap-4">
                             <Input label="Website" value={regData.companyWebsite} onChange={e => setRegData({...regData, companyWebsite: e.target.value})} />
                             <Input label="Address" value={regData.companyAddress} onChange={e => setRegData({...regData, companyAddress: e.target.value})} />
                           </div>
                           
                           <div className="flex flex-col items-center mb-4">
                             <label className="relative cursor-pointer group w-full">
                               <div className="w-full h-24 rounded-lg bg-gray-50 dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden hover:border-indigo-500 transition-colors">
                                 {regData.logo ? (
                                   <img src={regData.logo} alt="Preview" className="h-full object-contain" />
                                 ) : (
                                   <div className="text-center text-gray-400">
                                     <Upload size={24} className="mx-auto mb-1" />
                                     <span className="text-xs">Upload Company Logo</span>
                                   </div>
                                 )}
                               </div>
                               <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                             </label>
                           </div>
                           <p className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-2 rounded">
                             Note: HR accounts require Admin approval before access is granted.
                           </p>
                        </>
                     )}

                     <Button type="submit" className="w-full mt-4">Register</Button>
                     <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                       Already have an account? <button type="button" onClick={() => setIsLoginView(true)} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Login</button>
                     </div>
                  </form>
               </div>
             )}
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-4 text-slate-400 dark:text-slate-500 text-xs text-center w-full pointer-events-none">
        &copy; {new Date().getFullYear()} RecruitEase Institute Portal. All rights reserved.
      </div>
    </div>
  );
};