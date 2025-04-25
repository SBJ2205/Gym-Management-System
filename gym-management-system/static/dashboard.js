document.addEventListener("DOMContentLoaded", function () {

    // Member Management Elements (unchanged)
    const dropdown = document.querySelector(".dropdown");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const viewMembersBtn = document.getElementById("view-members-btn");
    const addMembersBtn = document.querySelector(".dropdown-content a:first-child");
    const addMemberFormContainer = document.getElementById("add-member-form-container");
    const memberTableContainer = document.getElementById("member-table-container");
    const memberTableBody = document.getElementById("member-table-body");
    const loginSuccessPopup = document.getElementById("login-success-popup");

    // Trainer Management Elements
    const trainerDropdown = document.querySelectorAll(".dropdown")[1];
    const trainerDropdownToggle = trainerDropdown?.querySelector(".dropdown-toggle");
    const addTrainersBtn = document.getElementById("add-trainers-btn");
    const viewTrainersBtn = document.getElementById("view-trainers-btn");
    const addTrainerFormContainer = document.getElementById("add-trainer-form-container");
    const trainerTableContainer = document.getElementById("trainer-table-container");

  
    // Helper function for notifications
    // Utility Functions Section
    function showNotification(message, isSuccess = true) {
        // Replace this with your actual notification system (Toast, SweetAlert, etc.)
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

  
    // Show login success popup
    if (loginSuccessPopup) {
        loginSuccessPopup.classList.add("active");
        setTimeout(() => {
            loginSuccessPopup.classList.remove("active");
        }, 2000);
    }

    // Member Dropdown Toggle (unchanged)
    dropdownToggle.addEventListener("click", function (event) {
        event.preventDefault();
        dropdown.classList.toggle("active");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("active");
        }
        if (trainerDropdown && !trainerDropdown.contains(event.target)) {
            trainerDropdown.classList.remove("active");
        }
    });

    // Member View Button (unchanged)
    viewMembersBtn.addEventListener("click", function (event) {
        event.preventDefault();
        addMemberFormContainer.classList.toggle("active");

        if (memberTableContainer.style.display === "none" || memberTableContainer.style.display === "") {
            memberTableContainer.style.display = "block";

            fetch("/admin/get_members")
                .then(response => response.json())
                .then(data => {
                    memberTableBody.innerHTML = "";
                    data.forEach(member => {
                        const row = `<tr>
                            <td>${member.id}</td>
                            <td>${member.first_name} ${member.last_name}</td>
                            <td>${member.email}</td>
                            <td>${member.phone}</td>
                            <td>${member.membership_expiry}</td>
                        </tr>`;
                        memberTableBody.innerHTML += row;
                    });
                })
                .catch(error => console.error("Error fetching members:", error));
        } else {
            memberTableContainer.style.opacity = 1;
            memberTableContainer.style.visibility = "visible";
        }
    });

    document.getElementById("cancel-member-btn")?.addEventListener("click", function() {
        document.getElementById("add-member-form-container").style.display = "none";
    });

    document.getElementById("close-member-table-btn")?.addEventListener("click", function() {
        document.getElementById("member-table-container").style.display = "none";
    });

    document.getElementById("close-member-attendance-btn")?.addEventListener("click", function() {
        document.getElementById("member-attendance-container").style.display = "none";
    });

    document.getElementById("close-trainer-attendance-btn")?.addEventListener("click", function() {
        document.getElementById("trainer-attendance-container").style.display = "none";
    });

    // Add Member Button (unchanged)
    addMembersBtn.addEventListener("click", function (event) {
        event.preventDefault();
        addMemberFormContainer.classList.toggle("active");
    });

        // Add Member Button (unchanged)
        addTrainersBtn.addEventListener("click", function (event) {
            event.preventDefault();
            addTrainerFormContainer.classList.toggle("active");
        });
    // Fetch trainers for member form dropdown (unchanged)
    const trainerSelect = document.getElementById("trainer");
    // Add this code to populate the trainer dropdown with IDs
    fetch("/admin/get_trainers")  // Create this endpoint if it doesn't exist
        .then(response => response.json())
        .then(trainers => {
            const trainerSelect = document.getElementById("trainer");
            trainers.forEach(trainer => {
                const option = document.createElement("option");
                option.value = trainer.id;  // Make sure this is the numeric ID
                option.textContent = trainer.first_name + " " + trainer.last_name;
                trainerSelect.appendChild(option);
            });
        });
    // Add Member Form Submission (unchanged)
    const addMemberForm = document.getElementById("add-member-form");
    addMemberForm.addEventListener("submit", function (event) {
        event.preventDefault();
    
        const formData = new FormData(addMemberForm);
        const memberData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            membership_expiry: formData.get('membership_expiry'),
            membership_plan: formData.get('membership_plan'),
            trainer_id: formData.get('trainer_id') || null
        };
    
        fetch("/admin/add_member", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(memberData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Member added successfully!");
                addMemberForm.reset();
                addMemberFormContainer.classList.remove("active");
            } else {
                alert("Error adding member: " + data.error);
            }
        })
        .catch(error => console.error("Error adding member:", error));
    });

    // Trainer Dropdown Toggle
    if (trainerDropdownToggle) {
        trainerDropdownToggle.addEventListener("click", function (event) {
            event.preventDefault();
            trainerDropdown.classList.toggle("active");
        });
    }

    // Add Trainer Button
    if (addTrainersBtn) {
        addTrainersBtn.addEventListener("click", function(event) {
            event.preventDefault();
            if (trainerTableContainer) trainerTableContainer.style.display = "none";
            if (addTrainerFormContainer) addTrainerFormContainer.style.display = "block";
            if (trainerDropdown) trainerDropdown.classList.remove("active");
        });
    }
        // Add Cancel Button Event Listener
    const cancelTrainerBtn = document.getElementById("cancel-trainer-btn");
    if (cancelTrainerBtn) {
        cancelTrainerBtn.addEventListener("click", function() {
            const addTrainerFormContainer = document.getElementById("add-trainer-form-container");
            if (addTrainerFormContainer) {
                addTrainerFormContainer.style.display = "none";
            }
            
            const addTrainerForm = document.getElementById("add-trainer-form");
            if (addTrainerForm) {
                addTrainerForm.reset();
            }
            
            
        });
    }
 

    if (viewTrainersBtn) {
        viewTrainersBtn.addEventListener("click", function(event) {
            event.preventDefault();
            if (addTrainerFormContainer) addTrainerFormContainer.style.display = "none";
            if (trainerTableContainer) trainerTableContainer.style.display = "block";
            if (trainerDropdown) trainerDropdown.classList.remove("active");
            
            fetch("/admin/get_trainers")
                .then(response => {
                    if (!response.ok) throw new Error("Network response was not ok");
                    return response.json();
                })
                .then(data => {
                    // ===== ADD THESE SAFETY CHECKS =====
                    if (!data) throw new Error("No data received");
                    if (!Array.isArray(data)) {
                        console.error("Expected array, got:", data);
                        throw new Error("Invalid data format");
                    }
                    // ===== END OF SAFETY CHECKS =====
                    
                    const tbody = document.getElementById("trainer-table-body");
                    if (tbody) {
                        tbody.innerHTML = "";
                        data.forEach(trainer => {  // This is line 453
                            const row = `
                            <tr>
                                <td>${trainer.trainer_id}</td>
                                <td>${trainer.first_name} ${trainer.last_name}</td>
                                <td>${trainer.email}</td>
                                <td>${trainer.expertise || "N/A"}</td>
                                <td>${trainer.phone_number || "N/A"}</td>
                            </tr>`;
                            tbody.innerHTML += row;
                        });
                    }
                })
                .catch(error => {
                    console.error("Error loading trainers:", error);
                    alert("Error loading trainers: " + error.message); // Keep using alert
                });
        });
    }

    // Add Trainer Form Submission
    const addTrainerForm = document.getElementById("add-trainer-form");
    if (addTrainerForm) {
        addTrainerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            const formData = new FormData(addTrainerForm);
            const trainerData = {
                first_name: formData.get("first_name"),
                last_name: formData.get("last_name"),
                email: formData.get("email"),
                password: formData.get("password"),
                phone_number: formData.get("phone_number"),
                expertise: formData.get("expertise"),
                certifications: formData.get("certifications"),
                availability: formData.get("availability")
            };

            fetch("/admin/add_trainer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(trainerData)
            })
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showNotification("Trainer added successfully!");
                    addTrainerForm.reset();
                    if (addTrainerFormContainer) addTrainerFormContainer.style.display = "none";
                } else {
                    throw new Error(data.error || "Failed to add trainer");
                }
            })

            .catch(error => {
                console.error("Error:", error);
                showNotification(error.message, 'error');
            });
        });
    }

    // Load Trainers
    async function loadTrainers(page = 1, searchQuery = "") {
        try {
            const response = await fetch(`/admin/get_trainers?query=${encodeURIComponent(searchQuery)}`);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Raw API response:", data);

            const tbody = document.getElementById("trainer-table-body");
            if (!tbody) {
                console.warn("Trainer table body not found");
                return;
            }

            tbody.innerHTML = "";

            if (!Array.isArray(data)) {
                throw new Error("Server returned unexpected data format");
            }

            data.forEach(trainer => {
                const row = document.createElement("tr");

                const cells = [
                    trainer.trainer_id ?? "N/A",
                    `${trainer.first_name ?? ""} ${trainer.last_name ?? ""}`.trim() || "N/A",
                    trainer.email ?? "N/A",
                    trainer.expertise ?? "N/A",
                    trainer.phone_number ?? "N/A"
                ];

                cells.forEach(cellContent => {
                    const td = document.createElement("td");
                    td.textContent = cellContent;
                    row.appendChild(td);
                });

                tbody.appendChild(row);
            });
        } catch (error) {
            console.error("Failed to load trainers:", error);
            alert(`Error loading trainers: ${error.message}`);
        }
    }

    document.addEventListener("DOMContentLoaded", loadTrainers);

        // Payment-related elements with null checks
        const paymentDropdown = document.querySelector(".dropdown-payments"); 
        const paymentDropdownToggle = paymentDropdown?.querySelector(".dropdown-toggle");
        const viewPaymentsBtn = document.getElementById("view-payments-btn");
        const addPaymentBtn = document.getElementById("add-payment-btn");
        const paymentTableContainer = document.getElementById("payment-table-container");
        const addPaymentFormContainer = document.getElementById("add-payment-form-container");
        const paymentsTableBody = document.getElementById("payments-table-body");
        const paymentSearch = document.getElementById("payment-search");
        const paymentFilter = document.getElementById("payment-filter");
        const prevPaymentPageBtn = document.getElementById("prev-payment-page");
        const nextPaymentPageBtn = document.getElementById("next-payment-page");
        const paymentPageInfo = document.getElementById("payment-page-info");
        const addPaymentForm = document.getElementById("add-payment-form");
        const cancelPaymentBtn = document.getElementById("cancel-payment-btn");

        // Only proceed if essential elements exist
        if (!viewPaymentsBtn || !addPaymentBtn || !paymentTableContainer || 
            !addPaymentFormContainer || !addPaymentForm) {
            console.warn("Payment management elements not found - skipping initialization");
            return;
        }

        let currentPaymentPage = 1;
        const paymentsPerPage = 10;

                // payment Dropdown Toggle
        if (paymentDropdownToggle) {
            paymentDropdownToggle.addEventListener("click", function (event) {
                event.preventDefault();
                paymentDropdown.classList.toggle("active");
            });
        }

            // Close dropdown when clicking outside
        document.addEventListener("click", function(event) {
            if (paymentDropdown && !paymentDropdown.contains(event.target)) {
                paymentDropdown.classList.remove("active");
            }
        });

        console.log("Payment elements check:", {
            paymentDropdown, paymentDropdownToggle, });

        // Event Listeners with existence checks
        viewPaymentsBtn.addEventListener("click", handleViewPayments);
        addPaymentBtn.addEventListener("click", handleAddPayment);
        cancelPaymentBtn.addEventListener("click", handleCancelPayment);
        paymentSearch.addEventListener("input", handlePaymentSearch);
        paymentFilter.addEventListener("change", handlePaymentFilter);
        prevPaymentPageBtn.addEventListener("click", handlePrevPage);
        nextPaymentPageBtn.addEventListener("click", handleNextPage);
        addPaymentForm.addEventListener("submit", handlePaymentSubmit);

        // Handler functions
        function handleViewPayments(e) {
            e.preventDefault();
            addPaymentFormContainer.style.display = "none";
            paymentTableContainer.style.display = "block";
            loadPayments();
        }

        function handleAddPayment(e) {
            e.preventDefault();
            paymentTableContainer.style.display = "none";
            addPaymentFormContainer.style.display = "block";
            loadMembersForPayment();
            document.getElementById("payment-date").valueAsDate = new Date();
        }

        function handleCancelPayment(e) {
            e.preventDefault();
            addPaymentFormContainer.style.display = "none";
            addPaymentForm.reset();
        }

        function handlePaymentSearch() {
            currentPaymentPage = 1;
            loadPayments();
        }

        function handlePaymentFilter() {
            currentPaymentPage = 1;
            loadPayments();
        }

        function handlePrevPage() {
            if (currentPaymentPage > 1) {
                currentPaymentPage--;
                loadPayments();
            }
        }

        function handleNextPage() {
            currentPaymentPage++;
            loadPayments();
        }

        function handlePaymentSubmit(e) {
            e.preventDefault();
            recordPayment();
        }

        // Load members for payment form dropdown
        function loadMembersForPayment() {
            fetch('/admin/get_members_for_payments')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(members => {
                    const select = document.getElementById("payment-member");
                    if (select) {
                        select.innerHTML = '<option value="">Select Member</option>';
                        members.forEach(member => {
                            const option = document.createElement("option");
                            option.value = member.id;
                            option.textContent = `${member.first_name} ${member.last_name} (${member.email})`;
                            select.appendChild(option);
                        });
                    }
                })
                .catch(error => {
                    console.error("Error loading members:", error);
                    showNotification("Failed to load members", false);
                });
        }

        // Load payment history
        function loadPayments() {
            const searchQuery = paymentSearch.value.trim();
            const filterValue = paymentFilter.value;
            
            fetch(`/admin/get_payments?page=${currentPaymentPage}&search=${encodeURIComponent(searchQuery)}&filter=${filterValue}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    paymentsTableBody.innerHTML = "";
                    
                    if (data.payments && data.payments.length > 0) {
                        data.payments.forEach(payment => {
                            const row = document.createElement("tr");
                            row.innerHTML = `
                                <td>${payment.id}</td>
                                <td>${payment.member_name}</td>
                                <td>₹${payment.amount.toFixed(2)}</td>
                                <td>${new Date(payment.payment_date).toLocaleDateString()}</td>
                                <td><span class="status-badge ${payment.status.toLowerCase()}">${payment.status}</span></td>
                                <td>${payment.payment_method}</td>
                                <td>
                                    <button class="btn-action btn-view" data-payment-id="${payment.id}">View</button>
                                    <button class="btn-action btn-edit" data-payment-id="${payment.id}">Edit</button>
                                </td>
                            `;
                            paymentsTableBody.appendChild(row);
                        });
                        
                        // Add event listeners to dynamically created buttons
                        document.querySelectorAll('.btn-view').forEach(btn => {
                            btn.addEventListener('click', () => {
                                viewPaymentDetails(btn.dataset.paymentId);
                            });
                        });
                        
                        document.querySelectorAll('.btn-edit').forEach(btn => {
                            btn.addEventListener('click', () => {
                                editPayment(btn.dataset.paymentId);
                            });
                        });
                    } else {
                        paymentsTableBody.innerHTML = `<tr><td colspan="7" class="no-data">No payments found</td></tr>`;
                    }
                    
                    paymentPageInfo.textContent = `Page ${currentPaymentPage} of ${data.total_pages || 1}`;
                    prevPaymentPageBtn.disabled = currentPaymentPage <= 1;
                    nextPaymentPageBtn.disabled = currentPaymentPage >= (data.total_pages || 1);
                })
                .catch(error => {
                    console.error("Error loading payments:", error);
                    showNotification("Failed to load payments", false);
                });
        }

        function recordPayment() {
            const formData = {
                member_id: parseInt(document.getElementById("payment-member").value),
                amount: parseFloat(document.getElementById("payment-amount").value),
                payment_method: document.getElementById("payment-method").value,
                notes: document.getElementById("payment-notes").value
            };
        
            // Validate
            if (!formData.member_id || isNaN(formData.amount) || !formData.payment_method) {
                showNotification("Please fill all required fields with valid values", false);
                return;
            }
        
            fetch('/admin/record_payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(async response => {
                // Clone the response to read it multiple times if needed
                const responseClone = response.clone();
                
                try {
                    // First try to parse as JSON
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || `Payment failed (Status ${response.status})`);
                    }
                    return data;
                } catch (jsonError) {
                    // If JSON parsing fails, read the cloned response as text
                    const text = await responseClone.text();
                    let errorMsg = text;
                    
                    // Try to extract error from HTML if present
                    try {
                        const doc = new DOMParser().parseFromString(text, 'text/html');
                        errorMsg = doc.title || text.slice(0, 100);
                    } catch (e) {
                        errorMsg = text.slice(0, 100);
                    }
                    
                    throw new Error(`Server error: ${errorMsg}`);
                }
            })
            .then(data => {
                showNotification(`Payment #${data.payment_id} recorded successfully!`);
                document.getElementById("add-payment-form").reset();
                loadPayments();
            })
            .catch(error => {
                console.error("Payment Error:", error);
                showNotification(`Payment failed: ${error.message.replace(/Error:/g, '')}`, false);
            });
        }

        // View payment details
        function viewPaymentDetails(paymentId) {
            fetch(`/admin/get_payment/${paymentId}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(payment => {
                    const modalContent = `
                        <div class="modal">
                            <div class="modal-content">
                                <span class="close-modal">&times;</span>
                                <h3>Payment Details</h3>
                                <div class="modal-body">
                                    <p><strong>Payment ID:</strong> ${payment.id}</p>
                                    <p><strong>Member:</strong> ${payment.member_name}</p>
                                    <p><strong>Amount:</strong> ₹${payment.amount.toFixed(2)}</p>
                                    <p><strong>Date:</strong> ${new Date(payment.payment_date).toLocaleDateString()}</p>
                                    <p><strong>Method:</strong> ${payment.payment_method}</p>
                                    <p><strong>Status:</strong> ${payment.status}</p>
                                    ${payment.notes ? `<p><strong>Notes:</strong> ${payment.notes}</p>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const modalContainer = document.createElement("div");
                    modalContainer.innerHTML = modalContent;
                    document.body.appendChild(modalContainer);
                    
                    // Add event listener to close button
                    modalContainer.querySelector('.close-modal').addEventListener('click', () => {
                        modalContainer.remove();
                    });
                })
                .catch(error => {
                    console.error("Error fetching payment details:", error);
                    showNotification("Failed to load payment details", false);
                });
        }

        // Edit payment - complete implementation
        function editPayment(paymentId) {
            fetch(`/admin/get_payment/${paymentId}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(payment => {
                    // Create modal with edit form
                    const modalContent = `
                        <div class="modal">
                            <div class="modal-content">
                                <span class="close-modal">&times;</span>
                                <h3>Edit Payment #${payment.id}</h3>
                                <form id="edit-payment-form">
                                    <div class="form-group">
                                        <label>Amount (₹):</label>
                                        <input type="number" step="0.01" value="${payment.amount.toFixed(2)}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Payment Method:</label>
                                        <select>
                                            <option ${payment.payment_method === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
                                            <option ${payment.payment_method === 'Cash' ? 'selected' : ''}>Cash</option>
                                            <option ${payment.payment_method === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                                            <option ${payment.payment_method === 'UPI' ? 'selected' : ''}>UPI</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Status:</label>
                                        <select>
                                            <option ${payment.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                            <option ${payment.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                            <option ${payment.status === 'Failed' ? 'selected' : ''}>Failed</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Notes:</label>
                                        <textarea>${payment.notes || ''}</textarea>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit" class="save-btn">Save Changes</button>
                                        <button type="button" class="cancel-btn">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;
                    
                    const modalContainer = document.createElement("div");
                    modalContainer.innerHTML = modalContent;
                    document.body.appendChild(modalContainer);
                    
                    // Close modal handlers
                    modalContainer.querySelector('.close-modal').addEventListener('click', () => {
                        modalContainer.remove();
                    });
                    
                    modalContainer.querySelector('.cancel-btn').addEventListener('click', () => {
                        modalContainer.remove();
                    });
                    
                    // Form submission handler
                    modalContainer.querySelector('#edit-payment-form').addEventListener('submit', (e) => {
                        e.preventDefault();
                        const form = e.target;
                        
                        const updatedData = {
                            amount: parseFloat(form.querySelector('input').value),
                            payment_method: form.querySelector('select').value,
                            status: form.querySelectorAll('select')[1].value,
                            notes: form.querySelector('textarea').value
                        };
                        
                        fetch(`/admin/update_payment/${paymentId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(updatedData)
                        })
                        .then(response => {
                            if (!response.ok) throw new Error('Update failed');
                            return response.json();
                        })
                        .then(data => {
                            if (data.success) {
                                showNotification("Payment updated successfully!");
                                modalContainer.remove();
                                // Refresh payment table or update specific row
                                if (typeof refreshPaymentsTable === 'function') {
                                    refreshPaymentsTable();
                                }
                            } else {
                                throw new Error(data.error || 'Update failed');
                            }
                        })
                        .catch(error => {
                            console.error("Error updating payment:", error);
                            showNotification(error.message || "Failed to update payment", false);
                        });
                    });
                })
                .catch(error => {
                    console.error("Error fetching payment details:", error);
                    showNotification("Failed to load payment for editing", false);
                });
        }


        // Add this to your existing JavaScript




// Attendance Management System


    // ======================
    // 1. ELEMENT REFERENCES
    // ======================
    const memberAttendanceContainer = document.getElementById("member-attendance-container");
    const memberAttendanceDate = document.getElementById("member-attendance-date");
    const refreshMemberAttendanceBtn = document.getElementById("refresh-member-attendance");
    const saveMemberAttendanceBtn = document.getElementById("save-member-attendance");
    const memberAttendanceTableBody = document.getElementById("member-attendance-body");
    const memberAttendanceBtn = document.getElementById("member-attendance-btn");

    const trainerAttendanceContainer = document.getElementById("trainer-attendance-container");
    const trainerAttendanceDate = document.getElementById("trainer-attendance-date");
    const refreshTrainerAttendanceBtn = document.getElementById("refresh-trainer-attendance");
    const saveTrainerAttendanceBtn = document.getElementById("save-trainer-attendance");
    const trainerAttendanceTableBody = document.getElementById("trainer-attendance-body");
    const trainerAttendanceBtn = document.getElementById("trainer-attendance-btn");

    const attendanceDropdown = document.querySelector(".dropdown-attendance");
    const attendanceDropdownToggle = attendanceDropdown?.querySelector(".dropdown-toggle");

    // ======================
    // 2. INITIALIZATION CHECK
    // ======================
    if (!memberAttendanceBtn || !trainerAttendanceBtn) {
        console.warn("Attendance buttons not found - skipping initialization");
        return;
    }

    // ======================
    // 3. CORE FUNCTIONS
    // ======================

    /**
     * Hides all management containers
     */
    function hideAllContainers() {
        document.querySelectorAll('.add-member-form-container, .member-table-container, ' +
                                 '.add-trainer-form-container, .trainer-table-container, ' +
                                 '.payment-table-container, .add-payment-form-container, ' +
                                 '.attendance-container').forEach(container => {
            container.style.display = 'none';
        });
    }

    /**
     * Loads member attendance data for selected date
     */
    async function loadMemberAttendance() {
        try {
            const date = memberAttendanceDate.value;
            console.log(`Loading member attendance for ${date}`);

            const response = await fetch(`/admin/get_members_for_attendance?date=${date}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load member attendance');
            }

            memberAttendanceTableBody.innerHTML = '';
            
            data.members.forEach(member => {
                const row = `
                    <tr data-member-id="${member.member_id}">
                        <td>${member.member_id}</td>
                        <td>${member.name}</td>
                        <td>
                            <select class="attendance-status">
                                <option value="Present" ${member.status === 'Present' ? 'selected' : ''}>Present</option>
                                <option value="Absent" ${member.status === 'Absent' ? 'selected' : ''}>Absent</option>
                            </select>
                        </td>
                        <td>
                            <input type="time" class="check-in-time" 
                                   value="${member.check_in ? member.check_in.substring(11, 16) : ''}">
                        </td>
                        <td>
                            <input type="time" class="check-out-time" 
                                   value="${member.check_out ? member.check_out.substring(11, 16) : ''}">
                        </td>
                    </tr>`;
                memberAttendanceTableBody.innerHTML += row;
            });

        } catch (error) {
            console.error('Member attendance load error:', error);
            showNotification(`Failed to load member attendance: ${error.message}`, false);
        }
    }

    /**
     * Loads trainer attendance data for selected date
     */
    async function loadTrainerAttendance() {
        try {
            const date = trainerAttendanceDate.value;
            console.log(`Loading trainer attendance for ${date}`);

            const response = await fetch(`/admin/get_trainers_for_attendance?date=${date}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load trainer attendance');
            }

            trainerAttendanceTableBody.innerHTML = '';
            
            data.trainers.forEach(trainer => {
                const row = `
                    <tr data-trainer-id="${trainer.trainer_id}">
                        <td>${trainer.trainer_id}</td>
                        <td>${trainer.name}</td>
                        <td>
                            <select class="attendance-status">
                                <option value="Present" ${trainer.status === 'Present' ? 'selected' : ''}>Present</option>
                                <option value="Absent" ${trainer.status === 'Absent' ? 'selected' : ''}>Absent</option>
                            </select>
                        </td>
                        <td>
                            <input type="time" class="check-in-time" 
                                   value="${trainer.check_in ? trainer.check_in.substring(11, 16) : ''}">
                        </td>
                        <td>
                            <input type="time" class="check-out-time" 
                                   value="${trainer.check_out ? trainer.check_out.substring(11, 16) : ''}">
                        </td>
                    </tr>`;
                trainerAttendanceTableBody.innerHTML += row;
            });

        } catch (error) {
            console.error('Trainer attendance load error:', error);
            showNotification(`Failed to load trainer attendance: ${error.message}`, false);
        }
    }

    /**
     * Saves member attendance data
     */
    async function saveMemberAttendance() {
        try {
            const date = memberAttendanceDate.value;
            const attendanceData = [];
            
            document.querySelectorAll('#member-attendance-body tr').forEach(row => {
                const memberId = row.getAttribute('data-member-id');
                const status = row.querySelector('.attendance-status').value;
                const checkIn = row.querySelector('.check-in-time').value;
                const checkOut = row.querySelector('.check-out-time').value;
                
                attendanceData.push({
                    member_id: memberId,
                    status: status,
                    check_in: checkIn ? `${date}T${checkIn}:00` : null,
                    check_out: checkOut ? `${date}T${checkOut}:00` : null
                });
            });

            const response = await fetch('/admin/record_attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    attendance: attendanceData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save member attendance');
            }

            showNotification('Member attendance saved successfully!');
            loadMemberAttendance();

        } catch (error) {
            console.error('Save member attendance error:', error);
            showNotification(`Failed to save member attendance: ${error.message}`, false);
        }
    }

    /**
     * Saves trainer attendance data
     */
    async function saveTrainerAttendance() {
        try {
            const date = trainerAttendanceDate.value;
            const attendanceData = [];
            
            document.querySelectorAll('#trainer-attendance-body tr').forEach(row => {
                const trainerId = row.getAttribute('data-trainer-id');
                const status = row.querySelector('.attendance-status').value;
                const checkIn = row.querySelector('.check-in-time').value;
                const checkOut = row.querySelector('.check-out-time').value;
                
                attendanceData.push({
                    trainer_id: trainerId,
                    status: status,
                    check_in: checkIn ? `${date}T${checkIn}:00` : null,
                    check_out: checkOut ? `${date}T${checkOut}:00` : null
                });
            });

            const response = await fetch('/admin/record_attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: date,
                    attendance: attendanceData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save trainer attendance');
            }

            showNotification('Trainer attendance saved successfully!');
            loadTrainerAttendance();

        } catch (error) {
            console.error('Save trainer attendance error:', error);
            showNotification(`Failed to save trainer attendance: ${error.message}`, false);
        }
    }

    // ======================
    // 4. EVENT HANDLERS
    // ======================

    function handleMemberAttendanceClick(event) {
        event.preventDefault();
        console.log("Member attendance button clicked");
        hideAllContainers();
        memberAttendanceContainer.style.display = 'block';
        loadMemberAttendance();
    }

    function handleTrainerAttendanceClick(event) {
        event.preventDefault();
        console.log("Trainer attendance button clicked");
        hideAllContainers();
        trainerAttendanceContainer.style.display = 'block';
        loadTrainerAttendance();
    }

    function handleAttendanceDateChange() {
        if (memberAttendanceContainer.style.display !== 'none') {
            loadMemberAttendance();
        } else if (trainerAttendanceContainer.style.display !== 'none') {
            loadTrainerAttendance();
        }
    }

    // ======================
    // 5. EVENT LISTENERS
    // ======================

    // Initialize with today's date
    const today = new Date().toISOString().split('T')[0];
    if (memberAttendanceDate) memberAttendanceDate.value = today;
    if (trainerAttendanceDate) trainerAttendanceDate.value = today;

    // Attendance buttons
    memberAttendanceBtn.addEventListener('click', handleMemberAttendanceClick);
    trainerAttendanceBtn.addEventListener('click', handleTrainerAttendanceClick);

    // Refresh buttons
    if (refreshMemberAttendanceBtn) {
        refreshMemberAttendanceBtn.addEventListener('click', loadMemberAttendance);
    }
    if (refreshTrainerAttendanceBtn) {
        refreshTrainerAttendanceBtn.addEventListener('click', loadTrainerAttendance);
    }

    // Save buttons
    if (saveMemberAttendanceBtn) {
        saveMemberAttendanceBtn.addEventListener('click', saveMemberAttendance);
    }
    if (saveTrainerAttendanceBtn) {
        saveTrainerAttendanceBtn.addEventListener('click', saveTrainerAttendance);
    }

    // Date change handlers
    if (memberAttendanceDate) {
        memberAttendanceDate.addEventListener('change', () => {
            if (memberAttendanceContainer.style.display !== 'none') {
                loadMemberAttendance();
            }
        });
    }
    if (trainerAttendanceDate) {
        trainerAttendanceDate.addEventListener('change', () => {
            if (trainerAttendanceContainer.style.display !== 'none') {
                loadTrainerAttendance();
            }
        });
    }

    // Dropdown toggle
    if (attendanceDropdownToggle) {
        attendanceDropdownToggle.addEventListener('click', function(event) {
            event.preventDefault();
            attendanceDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (attendanceDropdown && !attendanceDropdown.contains(event.target)) {
                attendanceDropdown.classList.remove('active');
            }
        });
    }



    console.log("Attendance Management System initialized successfully");

});