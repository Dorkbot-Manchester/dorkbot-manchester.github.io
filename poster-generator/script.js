async function loadSVGAndPopulateFields() {
    try {
        // Fetch the SVG file
        const response = await fetch('poster.svg');
        const svgText = await response.text();

        // Remove the font-face definition from SVG to avoid conflicts
        const cleanedSvgText = svgText.replace(/<style>[\s\S]*?<\/style>/, '<style>text { letter-spacing: -0.02em; }</style>');

        // Insert SVG directly into the container
        const svgContainer = document.getElementById('svg-container');
        svgContainer.innerHTML = cleanedSvgText;

        // Get the SVG element
        const svgElement = svgContainer.querySelector('svg');
        if (svgElement) {
            // Make SVG responsive
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
            svgElement.style.maxHeight = '100%';
        }

        // Extract top panel text
        const topPanel = svgContainer.querySelector('#panel-top');
        if (topPanel) {
            const topTexts = Array.from(topPanel.querySelectorAll('text'))
                .map(text => text.textContent.trim())
                .filter(text => text.length > 0);
            document.getElementById('textarea1').value = topTexts.join('\n');
        }

        // Extract bottom panel text
        const bottomPanel = svgContainer.querySelector('#panel-bottom');
        if (bottomPanel) {
            const bottomTexts = Array.from(bottomPanel.querySelectorAll('text'))
                .map(text => text.textContent.trim())
                .filter(text => text.length > 0);

            // Populate individual fields
            if (bottomTexts.length >= 1) {
                document.getElementById('date-field').value = bottomTexts[0]; // Date
            }
            if (bottomTexts.length >= 2) {
                document.getElementById('time-field').value = bottomTexts[1]; // Time
            }
            if (bottomTexts.length >= 3) {
                // Combine remaining text for venue details
                document.getElementById('details-field').value = bottomTexts.slice(2).join('\n');
            }
        }

        // Set up onChange listeners to update SVG
        setupSVGUpdateListeners();

    } catch (error) {
        console.error('Error loading SVG:', error);
        // Set error placeholders and message
        document.getElementById('textarea1').placeholder = 'Error loading data';
        document.getElementById('date-field').placeholder = 'Error loading data';
        document.getElementById('time-field').placeholder = 'Error loading data';
        document.getElementById('details-field').placeholder = 'Error loading data';

        const svgContainer = document.getElementById('svg-container');
        svgContainer.innerHTML = '<p style="color: red;">Error loading SVG</p>';
    }
}

function setupSVGUpdateListeners() {
    const svgContainer = document.getElementById('svg-container');

    // Update top panel text
    document.getElementById('textarea1').addEventListener('input', function() {
        const topPanel = svgContainer.querySelector('#panel-top');
        if (topPanel) {
            const lines = this.value.split('\n');
            const textElements = topPanel.querySelectorAll('text');

            // Update each text element with corresponding line
            textElements.forEach((textEl, index) => {
                if (index < lines.length) {
                    textEl.textContent = lines[index];
                } else {
                    textEl.textContent = '';
                }
            });
        }
    });

    // Update date field
    document.getElementById('date-field').addEventListener('input', function() {
        const dateElement = svgContainer.querySelector('#text-date');
        if (dateElement) {
            dateElement.textContent = this.value;
        }
    });

    // Update date font size
    document.getElementById('date-font-size').addEventListener('input', function() {
        const dateElement = svgContainer.querySelector('#text-date');

        if (dateElement) {
            dateElement.style.fontSize = this.value + 'px';
        }
    });

    // Update time field
    document.getElementById('time-field').addEventListener('input', function() {
        const timeElement = svgContainer.querySelector('#text-time');
        if (timeElement) {
            timeElement.textContent = this.value;
        }
    });

    // Update venue details
    document.getElementById('details-field').addEventListener('input', function() {
        const bottomPanel = svgContainer.querySelector('#panel-bottom');
        if (bottomPanel) {
            // Get all text elements except date and time (first two)
            const textElements = Array.from(bottomPanel.querySelectorAll('text')).slice(2);
            const lines = this.value.split('\n');

            // Update venue text elements with lines
            textElements.forEach((textEl, index) => {
                if (index < lines.length) {
                    textEl.textContent = lines[index];
                } else {
                    textEl.textContent = '';
                }
            });
        }
    });
}

// Export SVG to PDF
async function exportToPDF() {
    try {
        const svgContainer = document.getElementById('svg-container');
        const svgElement = svgContainer.querySelector('svg');
        
        // Create jsPDF instance with A4 dimensions
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Convert SVG to PDF
        await pdf.svg(svgElement, {
            x: 0,
            y: 0,
            width: 210, // A4 width in mm
            height: 297 // A4 height in mm
        }); 
        
        pdf.save('repair-cafe-poster.pdf');

    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Load SVG when page loads
document.addEventListener('DOMContentLoaded', loadSVGAndPopulateFields);