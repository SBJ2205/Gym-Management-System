document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentTrainerId = null; // This should be set after login
    let currentPlanId = null;
    let currentPlanType = null;
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Set current trainer ID (in a real app, this would come from login session)
    // For demo purposes, we'll use a hardcoded ID - in production, get this from your auth system
    currentTrainerId = 1; // Replace with actual trainer ID from login
    
    // Load initial data
    loadTrainerProfile();
    loadMembers();
    loadWorkoutPlans();
    loadDietPlans();
    updateDashboardCounts();
    
    // Sidebar navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', function() {
        const activeSection = document.querySelector('.content-section:not([style*="display: none"])').id;
        if (activeSection === 'dashboard-section') {
            loadTrainerProfile();
            loadMembers();
            loadWorkoutPlans();
            loadDietPlans();
            updateDashboardCounts();
        } else if (activeSection === 'profile-section') {
            loadTrainerProfile();
        } else if (activeSection === 'members-section') {
            loadMembers();
        } else if (activeSection === 'workout-plans-section') {
            loadWorkoutPlans();
        } else if (activeSection === 'diet-plans-section') {
            loadDietPlans();
        }
    });
    
    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateTrainerProfile();
    });
    
    // Password form submission
    document.getElementById('password-form').addEventListener('submit', function(e) {
        e.preventDefault();
        changePassword();
    });
    
    // New workout plan form submission
    document.getElementById('new-workout-plan-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createWorkoutPlan();
    });
    
    // New diet plan form submission
    document.getElementById('new-diet-plan-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createDietPlan();
    });
    
    // Delete plan button in modal
    document.getElementById('delete-plan-btn').addEventListener('click', function() {
        if (currentPlanId && currentPlanType) {
            deletePlan(currentPlanId, currentPlanType);
        }
    });
    
    // Logout button
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        // In a real app, you would call your logout API and redirect
        alert('You have been logged out. Redirecting to login page...');
        window.location.href = 'login.html'; // Replace with your login page
    });
    
    // Function to show a specific section
    function showSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Show the selected section
        document.getElementById(`${section}-section`).style.display = 'block';
        
        // Update main title
        const titles = {
            'dashboard': 'Dashboard',
            'profile': 'My Profile',
            'members': 'My Members',
            'workout-plans': 'Workout Plans',
            'diet-plans': 'Diet Plans'
        };
        document.getElementById('main-title').textContent = titles[section];
    }
    
    // Function to load trainer profile
    function loadTrainerProfile() {
        fetch(`/trainer/profile/${currentTrainerId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                // Update sidebar
                document.getElementById('trainer-name').textContent = `${data.first_name} ${data.last_name}`;
                document.getElementById('trainer-expertise').textContent = data.expertise || 'Fitness Trainer';
                
                // Update profile form
                document.getElementById('first-name').value = data.first_name;
                document.getElementById('last-name').value = data.last_name;
                document.getElementById('email').value = data.email;
                document.getElementById('phone').value = data.phone_number || '';
                document.getElementById('expertise').value = data.expertise || '';
                document.getElementById('availability').value = data.availability || '';
                document.getElementById('certifications').value = data.certifications || '';
            })
            .catch(error => {
                console.error('Error loading trainer profile:', error);
                alert('Failed to load trainer profile');
            });
    }
    
    // Function to update trainer profile
    function updateTrainerProfile() {
        const data = {
            first_name: document.getElementById('first-name').value,
            last_name: document.getElementById('last-name').value,
            phone_number: document.getElementById('phone').value,
            expertise: document.getElementById('expertise').value,
            availability: document.getElementById('availability').value,
            certifications: document.getElementById('certifications').value
        };
        
        fetch(`/trainer/profile/${currentTrainerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            alert('Profile updated successfully');
            loadTrainerProfile(); // Refresh the profile data
        })
        .catch(error => {
            console.error('Error updating trainer profile:', error);
            alert('Failed to update profile');
        });
    }
    
    // Function to change password
    function changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        // In a real app, you would send this to your change password endpoint
        // This is just a demo - you should never handle passwords like this in production
        alert('Password change functionality would be implemented here');
        document.getElementById('password-form').reset();
    }
    
    // Function to load members
    function loadMembers() {
        fetch(`/trainer/${currentTrainerId}/members`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(members => {
                const tableBody = document.querySelector('#members-table tbody');
                tableBody.innerHTML = '';
                
                if (members.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6">No members assigned to you</td></tr>';
                    return;
                }
                
                members.forEach(member => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${member.member_id}</td>
                        <td>${member.first_name} ${member.last_name}</td>
                        <td>${member.email}</td>
                        <td>${member.phone || 'N/A'}</td>
                        <td>${member.membership_plan || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-member-btn" data-member-id="${member.member_id}">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-member-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const memberId = this.getAttribute('data-member-id');
                        viewMemberDetails(memberId);
                    });
                });
                
                // Update member dropdowns in plan forms
                updateMemberDropdowns(members);
                
                // Update dashboard count
                document.getElementById('member-count').textContent = members.length;
            })
            .catch(error => {
                console.error('Error loading members:', error);
                document.querySelector('#members-table tbody').innerHTML = '<tr><td colspan="6">Error loading members</td></tr>';
            });
    }
    
    // Function to view member details
    function viewMemberDetails(memberId) {
        fetch(`/trainer/${currentTrainerId}/member/${memberId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(member => {
                // Populate modal
                document.getElementById('modal-member-name').textContent = `${member.first_name} ${member.last_name}`;
                document.getElementById('modal-member-email').textContent = member.email;
                document.getElementById('modal-member-phone').textContent = member.phone || 'N/A';
                document.getElementById('modal-member-age').textContent = member.age || 'N/A';
                document.getElementById('modal-member-gender').textContent = member.gender || 'N/A';
                document.getElementById('modal-member-plan').textContent = member.membership_plan || 'N/A';
                document.getElementById('modal-member-expiry').textContent = member.membership_expiry || 'N/A';
                document.getElementById('modal-member-emergency').textContent = member.emergency_contact || 'N/A';
                document.getElementById('modal-member-address').textContent = member.address || 'N/A';
                
                // Show modal
                const memberModal = new bootstrap.Modal(document.getElementById('memberModal'));
                memberModal.show();
            })
            .catch(error => {
                console.error('Error loading member details:', error);
                alert('Failed to load member details');
            });
    }
    
    // Function to update member dropdowns in plan forms
    function updateMemberDropdowns(members) {
        const workoutMemberSelect = document.getElementById('workout-member');
        const dietMemberSelect = document.getElementById('diet-member');
        
        // Clear existing options except the first one
        while (workoutMemberSelect.options.length > 1) {
            workoutMemberSelect.remove(1);
        }
        while (dietMemberSelect.options.length > 1) {
            dietMemberSelect.remove(1);
        }
        
        // Add member options
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.member_id;
            option.textContent = `${member.first_name} ${member.last_name}`;
            
            workoutMemberSelect.appendChild(option.cloneNode(true));
            dietMemberSelect.appendChild(option);
        });
    }
    
    // Function to load workout plans
    function loadWorkoutPlans() {
        fetch(`/trainer/${currentTrainerId}/workout_plans`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(plans => {
                const tableBody = document.querySelector('#workout-plans-table tbody');
                tableBody.innerHTML = '';
                
                if (plans.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No workout plans created yet</td></tr>';
                    return;
                }
                
                plans.forEach(plan => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${plan.member_name}</td>
                        <td>${plan.plan_details.substring(0, 50)}${plan.plan_details.length > 50 ? '...' : ''}</td>
                        <td>${plan.created_at}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-plan-btn" data-plan-id="${plan.plan_id}" data-plan-type="workout">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-plan-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const planId = this.getAttribute('data-plan-id');
                        const planType = this.getAttribute('data-plan-type');
                        viewPlanDetails(planId, planType);
                    });
                });
                
                // Update dashboard count
                document.getElementById('workout-plan-count').textContent = plans.length;
                
                // Update recent activity
                updateRecentActivity(plans, 'workout');
            })
            .catch(error => {
                console.error('Error loading workout plans:', error);
                document.querySelector('#workout-plans-table tbody').innerHTML = '<tr><td colspan="4">Error loading workout plans</td></tr>';
            });
    }
    
    // Function to load diet plans
    function loadDietPlans() {
        fetch(`/trainer/${currentTrainerId}/diet_plans`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(plans => {
                const tableBody = document.querySelector('#diet-plans-table tbody');
                tableBody.innerHTML = '';
                
                if (plans.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="4">No diet plans created yet</td></tr>';
                    return;
                }
                
                plans.forEach(plan => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${plan.member_name}</td>
                        <td>${plan.diet_details.substring(0, 50)}${plan.diet_details.length > 50 ? '...' : ''}</td>
                        <td>${plan.created_at}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-plan-btn" data-plan-id="${plan.diet_id}" data-plan-type="diet">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-plan-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const planId = this.getAttribute('data-plan-id');
                        const planType = this.getAttribute('data-plan-type');
                        viewPlanDetails(planId, planType);
                    });
                });
                
                // Update dashboard count
                document.getElementById('diet-plan-count').textContent = plans.length;
                
                // Update recent activity
                updateRecentActivity(plans, 'diet');
            })
            .catch(error => {
                console.error('Error loading diet plans:', error);
                document.querySelector('#diet-plans-table tbody').innerHTML = '<tr><td colspan="4">Error loading diet plans</td></tr>';
            });
    }
    
    // Function to view plan details
    function viewPlanDetails(planId, planType) {
        currentPlanId = planId;
        currentPlanType = planType;
        
        const endpoint = planType === 'workout' ? 'workout_plan' : 'diet_plan';
        
        fetch(`/trainer/${currentTrainerId}/${endpoint}/${planId}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(plan => {
                // Populate modal
                document.getElementById('planModalTitle').textContent = 
                    `${planType === 'workout' ? 'Workout' : 'Diet'} Plan Details`;
                document.getElementById('modal-plan-member').textContent = plan.member_name;
                document.getElementById('modal-plan-created').textContent = plan.created_at;
                document.getElementById('modal-plan-details').textContent = 
                    planType === 'workout' ? plan.plan_details : plan.diet_details;
                
                // Show modal
                const planModal = new bootstrap.Modal(document.getElementById('planModal'));
                planModal.show();
            })
            .catch(error => {
                console.error(`Error loading ${planType} plan details:`, error);
                alert(`Failed to load ${planType} plan details`);
            });
    }
    
    // Function to create a new workout plan
    function createWorkoutPlan() {
        const memberId = document.getElementById('workout-member').value;
        const planDetails = document.getElementById('workout-details').value;
        
        if (!memberId || !planDetails) {
            alert('Please select a member and enter plan details');
            return;
        }
        
        fetch(`/trainer/${currentTrainerId}/workout_plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                member_id: memberId,
                plan_details: planDetails
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            alert('Workout plan created successfully');
            document.getElementById('new-workout-plan-form').reset();
            loadWorkoutPlans();
            updateDashboardCounts();
        })
        .catch(error => {
            console.error('Error creating workout plan:', error);
            alert('Failed to create workout plan');
        });
    }
    
    // Function to create a new diet plan
    function createDietPlan() {
        const memberId = document.getElementById('diet-member').value;
        const dietDetails = document.getElementById('diet-details').value;
        
        if (!memberId || !dietDetails) {
            alert('Please select a member and enter diet details');
            return;
        }
        
        fetch(`/trainer/${currentTrainerId}/diet_plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                member_id: memberId,
                diet_details: dietDetails
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            alert('Diet plan created successfully');
            document.getElementById('new-diet-plan-form').reset();
            loadDietPlans();
            updateDashboardCounts();
        })
        .catch(error => {
            console.error('Error creating diet plan:', error);
            alert('Failed to create diet plan');
        });
    }
    
    // Function to delete a plan
    function deletePlan(planId, planType) {
        const endpoint = planType === 'workout' ? 'workout_plan' : 'diet_plan';
        const confirmDelete = confirm(`Are you sure you want to delete this ${planType} plan?`);
        
        if (!confirmDelete) return;
        
        fetch(`/trainer/${currentTrainerId}/${endpoint}/${planId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            alert(`${planType === 'workout' ? 'Workout' : 'Diet'} plan deleted successfully`);
            
            // Hide the modal
            const planModal = bootstrap.Modal.getInstance(document.getElementById('planModal'));
            planModal.hide();
            
            // Refresh the appropriate list
            if (planType === 'workout') {
                loadWorkoutPlans();
            } else {
                loadDietPlans();
            }
            
            updateDashboardCounts();
        })
        .catch(error => {
            console.error(`Error deleting ${planType} plan:`, error);
            alert(`Failed to delete ${planType} plan`);
        });
    }
    
    // Function to update dashboard counts
    function updateDashboardCounts() {
        // Member count is updated in loadMembers()
        // Workout plan count is updated in loadWorkoutPlans()
        // Diet plan count is updated in loadDietPlans()
    }
    
    // Function to update recent activity
    function updateRecentActivity(plans, planType) {
        const activityList = document.getElementById('recent-activity');
        
        // For demo purposes, we'll just show the most recent 3 plans
        const recentPlans = plans.slice(0, 3);
        
        activityList.innerHTML = '';
        
        if (recentPlans.length === 0) {
            activityList.innerHTML = '<li class="list-group-item">No recent activity</li>';
            return;
        }
        
        recentPlans.forEach(plan => {
            const item = document.createElement('li');
            item.className = 'list-group-item';
            
            const icon = planType === 'workout' ? 'dumbbell' : 'utensils';
            const typeText = planType === 'workout' ? 'Workout Plan' : 'Diet Plan';
            
            item.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <i class="fas fa-${icon} me-2 text-${planType === 'workout' ? 'primary' : 'success'}"></i>
                        <strong>${typeText}</strong> for ${plan.member_name}
                    </div>
                    <small class="text-muted">${plan.created_at}</small>
                </div>
                <div class="mt-2">${(planType === 'workout' ? plan.plan_details : plan.diet_details).substring(0, 60)}...</div>
            `;
            
            activityList.appendChild(item);
        });
    }
});