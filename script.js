document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const birthdayForm = document.getElementById('birthday-form');
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const messageInput = document.getElementById('message');
    const shareSection = document.getElementById('share-section');
    const shareLinkInput = document.getElementById('share-link');
    const copyBtn = document.getElementById('copy-btn');
    const thankYouSection = document.getElementById('thank-you');
    const submittedInfo = document.getElementById('submitted-info');
    const responsesSection = document.getElementById('responses');
    const responsesList = document.getElementById('responses-list');
    const greeting = document.getElementById('greeting');
    
    // Social share buttons
    const shareFacebook = document.getElementById('share-facebook');
    const shareEmail = document.getElementById('share-email');
    const shareWhatsApp = document.getElementById('share-whatsapp');
    
    // Store responses
    let responses = [];
    
    // Check if this is a shared link with a custom message
    const urlParams = new URLSearchParams(window.location.search);
    const fromName = urlParams.get('from');
    const customMessage = urlParams.get('message');
    
    if (fromName) {
        greeting.textContent = `${fromName} muốn biết ngày sinh của bạn!`;
        if (customMessage) {
            greeting.textContent += ` "${customMessage}"`;
        }
        
        // Hide share section if this is a response page
        shareSection.style.display = 'none';
        
        // Show responses section if we have stored responses
        loadResponses();
    } else {
        // This is the creator's view
        generateShareLink();
        
        // Show responses section if we have stored responses
        loadResponses();
    }
    
    // Handle form submission
    birthdayForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const birthdate = birthdateInput.value;
        const message = messageInput.value.trim();
        
        if (!name || !birthdate) {
            alert('Vui lòng điền đầy đủ họ tên và ngày sinh!');
            return;
        }
        
        // Format the date for display
        const formattedDate = formatDate(birthdate);
        
        // Create response object
        const response = {
            name: name,
            birthdate: birthdate,
            formattedDate: formattedDate,
            message: message,
            timestamp: new Date().toISOString()
        };
        
        // Save response
        saveResponse(response);
        
        // Show thank you message
        showThankYou(response);
        
        // Clear form
        birthdayForm.reset();
    });
    
    // Generate share link
    function generateShareLink() {
        const baseUrl = window.location.href.split('?')[0];
        const defaultLink = `${baseUrl}?from=Bạn của bạn`;
        shareLinkInput.value = defaultLink;
        
        // Update link when name changes
        nameInput.addEventListener('input', function() {
            const name = nameInput.value.trim();
            let shareLink = baseUrl;
            
            if (name) {
                shareLink += `?from=${encodeURIComponent(name)}`;
                
                const message = messageInput.value.trim();
                if (message) {
                    shareLink += `&message=${encodeURIComponent(message)}`;
                }
            } else {
                shareLink = defaultLink;
            }
            
            shareLinkInput.value = shareLink;
        });
        
        // Update link when message changes
        messageInput.addEventListener('input', function() {
            const name = nameInput.value.trim() || 'Bạn của bạn';
            const message = messageInput.value.trim();
            let shareLink = `${baseUrl}?from=${encodeURIComponent(name)}`;
            
            if (message) {
                shareLink += `&message=${encodeURIComponent(message)}`;
            }
            
            shareLinkInput.value = shareLink;
        });
    }
    
    // Copy link to clipboard
    copyBtn.addEventListener('click', function() {
        shareLinkInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Đã sao chép!';
        
        setTimeout(() => {
            copyBtn.textContent = 'Sao chép';
        }, 2000);
    });
    
    // Social sharing
    shareFacebook.addEventListener('click', function() {
        const url = encodeURIComponent(shareLinkInput.value);
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(shareUrl, '_blank');
    });
    
    shareEmail.addEventListener('click', function() {
        const subject = encodeURIComponent('Chia sẻ ngày sinh của bạn với tôi');
        const body = encodeURIComponent(`Xin chào! Tôi muốn biết ngày sinh của bạn. Vui lòng truy cập liên kết này: ${shareLinkInput.value}`);
        const shareUrl = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = shareUrl;
    });
    
    shareWhatsApp.addEventListener('click', function() {
        const text = encodeURIComponent(`Xin chào! Tôi muốn biết ngày sinh của bạn. Vui lòng truy cập liên kết này: ${shareLinkInput.value}`);
        const shareUrl = `https://wa.me/?text=${text}`;
        window.open(shareUrl, '_blank');
    });
    
    // Save response to localStorage
    function saveResponse(response) {
        // Load existing responses
        const storedResponses = localStorage.getItem('birthdayResponses');
        responses = storedResponses ? JSON.parse(storedResponses) : [];
        
        // Add new response
        responses.push(response);
        
        // Save back to localStorage
        localStorage.setItem('birthdayResponses', JSON.stringify(responses));
        
        // Update responses list
        displayResponses();
    }
    
    // Load responses from localStorage
    function loadResponses() {
        const storedResponses = localStorage.getItem('birthdayResponses');
        if (storedResponses) {
            responses = JSON.parse(storedResponses);
            displayResponses();
        }
    }
    
    // Display responses
    function displayResponses() {
        if (responses.length === 0) {
            responsesSection.style.display = 'none';
            return;
        }
        
        responsesSection.style.display = 'block';
        responsesList.innerHTML = '';
        
        // Sort responses by timestamp (newest first)
        responses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        responses.forEach(response => {
            const responseItem = document.createElement('div');
            responseItem.className = 'response-item';
            
            responseItem.innerHTML = `
                <div class="response-name">${response.name}</div>
                <div class="response-date">Ngày sinh: ${response.formattedDate}</div>
                ${response.message ? `<div class="response-message">${response.message}</div>` : ''}
            `;
            
            responsesList.appendChild(responseItem);
        });
    }
    
    // Show thank you message
    function showThankYou(response) {
        birthdayForm.style.display = 'none';
        thankYouSection.style.display = 'block';
        
        submittedInfo.innerHTML = `
            <p><strong>Họ và Tên:</strong> ${response.name}</p>
            <p><strong>Ngày Sinh:</strong> ${response.formattedDate}</p>
            ${response.message ? `<p><strong>Lời Nhắn:</strong> ${response.message}</p>` : ''}
        `;
    }
    
    // Format date to dd/mm/yyyy
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }
}); 