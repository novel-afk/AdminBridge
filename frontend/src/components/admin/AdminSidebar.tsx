            {/* Jobs Section */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase px-4">Jobs</p>
              <div className="space-y-1">
                <NavLink 
                  to="/admin/jobs" 
                  className={({ isActive }) => 
                    isActive 
                      ? "flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg" 
                      : "flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  }
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Jobs
                </NavLink>
                <NavLink 
                  to="/admin/jobs/applications" 
                  className={({ isActive }) => 
                    isActive 
                      ? "flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg" 
                      : "flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  }
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Applications
                </NavLink>
              </div>
            </div>

            {/* Leads Section */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase px-4">Leads</p>
              <div className="space-y-1">
                <NavLink 
                  to="/admin/leads" 
                  className={({ isActive }) => 
                    isActive 
                      ? "flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg" 
                      : "flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  }
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  All Leads
                </NavLink>
                <NavLink 
                  to="/admin/leads/add" 
                  className={({ isActive }) => 
                    isActive 
                      ? "flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg" 
                      : "flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  }
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Add Lead
                </NavLink>
              </div>
            </div> 