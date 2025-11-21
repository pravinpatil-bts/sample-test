// DOM elements
const queryInput = document.getElementById('queryInput');
const apiEndpoint = document.getElementById('apiEndpoint');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.querySelector('.btn-text');
const spinner = document.querySelector('.spinner');
const responseSection = document.getElementById('responseSection');
const responseContent = document.getElementById('responseContent');
const errorSection = document.getElementById('errorSection');
const errorContent = document.getElementById('errorContent');

// Load saved API endpoint from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedEndpoint = localStorage.getItem('apiEndpoint');
    if (savedEndpoint) {
        apiEndpoint.value = savedEndpoint;
    }
});

// Save API endpoint to localStorage when changed
apiEndpoint.addEventListener('blur', () => {
    localStorage.setItem('apiEndpoint', apiEndpoint.value);
});

// Handle form submission
submitBtn.addEventListener('click', async () => {
    const query = queryInput.value.trim();
    const endpoint = apiEndpoint.value.trim();

    // Validation
    if (!query) {
        showError('Please enter a query');
        return;
    }

    if (!endpoint) {
        showError('Please enter an API Gateway endpoint URL');
        return;
    }

    // Validate URL format
    try {
        new URL(endpoint);
    } catch (e) {
        showError('Please enter a valid URL for the API endpoint');
        return;
    }

    // Hide previous responses
    hideResponses();

    // Show loading state
    setLoadingState(true);

    try {
        // Make POST request to API Gateway
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query
            })
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            showResponse(data, true);
        } else {
            data = await response.text();
            showResponse(data, false);
        }

    } catch (error) {
        showError(`Failed to fetch data: ${error.message}`);
    } finally {
        setLoadingState(false);
    }
});

// Allow Enter key to submit (Ctrl+Enter for newline in textarea)
queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        submitBtn.click();
    }
});

// Helper functions
function setLoadingState(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.textContent = isLoading ? 'Submitting...' : 'Submit Query';
    spinner.style.display = isLoading ? 'block' : 'none';
}

function hideResponses() {
    responseSection.style.display = 'none';
    errorSection.style.display = 'none';
}

function showResponse(data, isJson) {
    hideResponses();
    
    if (isJson) {
        // Format JSON with syntax highlighting
        const formatted = JSON.stringify(data, null, 2);
        responseContent.innerHTML = `<pre class="json-response">${escapeHtml(formatted)}</pre>`;
    } else {
        // Show plain text
        responseContent.textContent = data;
    }
    
    responseSection.style.display = 'block';
    
    // Smooth scroll to response
    setTimeout(() => {
        responseSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function showError(message) {
    hideResponses();
    errorContent.textContent = message;
    errorSection.style.display = 'block';
    
    // Smooth scroll to error
    setTimeout(() => {
        errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
