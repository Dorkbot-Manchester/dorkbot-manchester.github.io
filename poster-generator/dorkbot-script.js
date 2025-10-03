// Global state
let talks = [];
let demos = [];
let talkCounter = 0;
let demoCounter = 0;

// LocalStorage key
const STORAGE_KEY = 'dorkbot_poster_state';

// Save state to localStorage
function saveState() {
    const state = {
        talks,
        demos,
        talkCounter,
        demoCounter,
        accentColor1: document.getElementById('accent-color-1')?.value || '#000000',
        accentColor2: document.getElementById('accent-color-2')?.value || '#ab4d22',
        editionNumber: document.getElementById('edition-number')?.value || '',
        eventDetails: document.getElementById('event-details')?.value || '',
        talksFooter: document.getElementById('talks-footer')?.value || '',
        demosFooter: document.getElementById('demos-footer')?.value || ''
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving state:', e);
    }
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch (e) {
        console.error('Error loading saved state:', e);
        return null;
    }
}

// Apply saved colors and state to SVG elements
function applySavedColorsToSVG(svgContainer) {
    const accentColor1 = document.getElementById('accent-color-1').value;
    const accentColor2 = document.getElementById('accent-color-2').value;
    const editionNumber = document.getElementById('edition-number').value;
    const eventDetails = document.getElementById('event-details').value;
    const talksFooter = document.getElementById('talks-footer').value;
    const demosFooter = document.getElementById('demos-footer').value;

    // Apply accent color 1 to logotype
    const logotype = svgContainer.querySelector('#g_dorkbot_logotype');
    if (logotype) {
        const paths = logotype.querySelectorAll('path');
        paths.forEach(path => {
            path.style.fill = accentColor1;
        });
    }

    // Apply accent color 1 to callout rectangles
    const rects = svgContainer.querySelectorAll('.r_hilite');
    rects.forEach(rect => {
        rect.style.fill = accentColor1;
    });

    // Apply accent color 2 to edition number
    const editionEl = svgContainer.querySelector('#edition_number');
    if (editionEl) {
        editionEl.style.fill = accentColor2;
        editionEl.textContent = editionNumber;
    }

    // Apply event details
    const gDetails = svgContainer.querySelector('#g_details');
    if (gDetails) {
        const lines = eventDetails.split('\n');
        const textElements = Array.from(gDetails.querySelectorAll('text'));
        const tspans = textElements.flatMap(t => Array.from(t.querySelectorAll('tspan')));

        tspans.forEach((tspan, index) => {
            if (index < lines.length) {
                tspan.textContent = lines[index];
            } else {
                tspan.textContent = '';
            }
        });
    }

    // Apply talks footer
    const gTalks = svgContainer.querySelector('#g_talks');
    if (gTalks) {
        const footerText = gTalks.querySelector('#footer_talks');
        if (footerText) {
            footerText.textContent = talksFooter;
        }
    }

    // Apply demos footer
    const gDemos = svgContainer.querySelector('#g_demos');
    if (gDemos) {
        const footerText = gDemos.querySelector('#footer_demos');
        if (footerText) {
            footerText.textContent = demosFooter;
        }
    }
}

// Constants for SVG layout
const LINE_HEIGHT = 41.667; // Height of one line (41.667 * 1.1em)
const TALK_START_Y = 91.67; // Y position of first talk
const DEMO_START_Y = TALK_START_Y; // Y position of first demo
// const NAME_HEIGHT = 41.667; // Height of name text
// const NAME_TO_DESC_SPACING = 45.83; // Space between name and description
const ITEM_BOTTOM_MARGIN = LINE_HEIGHT/2; // Space after each talk/demo item
//const CALLOUT_HEIGHT = 269; // Height of open dork/demos callout box
const CALLOUT_HEIGHT = LINE_HEIGHT * 6; // Height of open dork/demos callout box
const FOOTER_HEIGHT = 41.667; // Height of footer text

async function loadSVGAndPopulateFields() {
    try {
        // Fetch the SVG file
        const response = await fetch('template.svg');
        const svgText = await response.text();

        // Insert SVG directly into the container
        const svgContainer = document.getElementById('svg-container');
        svgContainer.innerHTML = svgText;

        // Get the SVG element
        const svgElement = svgContainer.querySelector('svg');
        if (svgElement) {
            // Make SVG responsive
            svgElement.style.width = '100%';
            svgElement.style.height = 'auto';
            svgElement.style.maxWidth = '100%';
            svgElement.style.maxHeight = '100%';
        }

        // Check for saved state
        const savedState = loadState();
        const useSavedState = savedState !== null;

        if (useSavedState) {
            // Restore from saved state
            talks = savedState.talks || [];
            demos = savedState.demos || [];
            talkCounter = savedState.talkCounter || 0;
            demoCounter = savedState.demoCounter || 0;

            document.getElementById('edition-number').value = savedState.editionNumber || '';
            document.getElementById('accent-color-1').value = savedState.accentColor1 || '#000000';
            document.getElementById('accent-color-2').value = savedState.accentColor2 || '#ab4d22';
            document.getElementById('event-details').value = savedState.eventDetails || '';
            document.getElementById('talks-footer').value = savedState.talksFooter || '';
            document.getElementById('demos-footer').value = savedState.demosFooter || '';

            // Render UI elements
            talks.forEach(talk => addTalkUI(talk));
            demos.forEach(demo => addDemoUI(demo));
        } else {
            // Extract from SVG (first time load)
            // Extract edition number and its color
            const editionNumber = svgContainer.querySelector('#edition_number');
            if (editionNumber) {
                document.getElementById('edition-number').value = editionNumber.textContent.trim();

                // Extract fill color from edition number
                const fillStyle = editionNumber.style.fill || editionNumber.getAttribute('fill');
                if (fillStyle) {
                    const color = rgbToHex(fillStyle);
                    document.getElementById('accent-color-2').value = color;
                }
            }

            // Extract logotype color (accent color 1)
            const logotype = svgContainer.querySelector('#g_dorkbot_logotype');
            if (logotype) {
                const pathEl = logotype.querySelector('path');
                if (pathEl) {
                    const fillStyle = pathEl.style.fill || pathEl.getAttribute('fill');
                    if (fillStyle) {
                        const color = rgbToHex(fillStyle);
                        document.getElementById('accent-color-1').value = color;
                    }
                }
            }

            // Extract event details from g_details
            const gDetails = svgContainer.querySelector('#g_details');
            if (gDetails) {
                const allText = Array.from(gDetails.querySelectorAll('text'))
                    .flatMap(text => {
                        const tspans = text.querySelectorAll('tspan');
                        if (tspans.length > 0) {
                            return Array.from(tspans).map(t => t.textContent.trim());
                        }
                        return [text.textContent.trim()];
                    })
                    .filter(t => t.length > 0 && !t.includes('dorkbot'));

                document.getElementById('event-details').value = allText.join('\n');
            }

            // Extract talks
            const gTalks = svgContainer.querySelector('#g_talks');
            if (gTalks) {
                const talkGroups = Array.from(gTalks.children).filter(el => el.tagName === 'g' && !el.id);

                talkGroups.forEach((group, index) => {
                    const nameEl = group.querySelector('text[text-decoration="underline"]');
                    const descEl = group.querySelectorAll('text')[1];

                    if (nameEl && descEl) {
                        const name = nameEl.textContent.trim();
                        const tspans = Array.from(descEl.querySelectorAll('tspan')).map(t => t.textContent.trim());
                        const description = tspans.join('\n');

                        talks.push({ id: talkCounter++, name, description });
                    }
                });

                // Render talk UI elements
                talks.forEach(talk => addTalkUI(talk));

                // Talks footer
                const footerTalks = gTalks.querySelector('#footer_talks');
                if (footerTalks) {
                    document.getElementById('talks-footer').value = footerTalks.textContent.trim();
                }
            }

            // Extract demos
            const gDemos = svgContainer.querySelector('#g_demos');
            if (gDemos) {
                const demoGroups = Array.from(gDemos.children).filter(el => el.tagName === 'g' && !el.id);

                demoGroups.forEach((group, index) => {
                    const nameEl = group.querySelector('text[text-decoration="underline"]');
                    const descEl = group.querySelectorAll('text')[1];

                    if (nameEl && descEl) {
                        const name = nameEl.textContent.trim();
                        const tspans = Array.from(descEl.querySelectorAll('tspan')).map(t => t.textContent.trim());
                        const description = tspans.join('\n');

                        demos.push({ id: demoCounter++, name, description });
                    }
                });

                // Render demo UI elements
                demos.forEach(demo => addDemoUI(demo));

                // Demos footer
                const footerDemos = gDemos.querySelector('#footer_demos');
                if (footerDemos) {
                    document.getElementById('demos-footer').value = footerDemos.textContent.trim();
                }
            }
        }

        // Set up onChange listeners to update SVG
        setupSVGUpdateListeners();
        updateSVG();

        // If we restored from saved state, apply the saved colors to the SVG
        if (useSavedState) {
            applySavedColorsToSVG(svgContainer);
        }

    } catch (error) {
        console.error('Error loading SVG:', error);
        const svgContainer = document.getElementById('svg-container');
        svgContainer.innerHTML = '<p style="color: red;">Error loading SVG</p>';
    }
}

function addTalkUI(talk) {
    const container = document.getElementById('talks-container');
    const talkDiv = document.createElement('div');
    talkDiv.className = 'card mb-3';
    talkDiv.setAttribute('data-talk-id', talk.id);

    talkDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Talk ${talks.findIndex(t => t.id === talk.id) + 1}</h6>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeTalk(${talk.id})">Remove</button>
            </div>
            <div class="mb-2">
                <label class="form-label">Speaker Name</label>
                <input type="text" class="form-control" data-field="name" value="${talk.name || ''}"
                    oninput="updateTalkField(${talk.id}, 'name', this.value)">
            </div>
            <div class="mb-2">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" data-field="description"
                    oninput="updateTalkField(${talk.id}, 'description', this.value)">${talk.description || ''}</textarea>
            </div>
        </div>
    `;

    container.appendChild(talkDiv);
}

function addDemoUI(demo) {
    const container = document.getElementById('demos-container');
    const demoDiv = document.createElement('div');
    demoDiv.className = 'card mb-3';
    demoDiv.setAttribute('data-demo-id', demo.id);

    demoDiv.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="mb-0">Demo ${demos.findIndex(d => d.id === demo.id) + 1}</h6>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeDemo(${demo.id})">Remove</button>
            </div>
            <div class="mb-2">
                <label class="form-label">Presenter Name</label>
                <input type="text" class="form-control" data-field="name" value="${demo.name || ''}"
                    oninput="updateDemoField(${demo.id}, 'name', this.value)">
            </div>
            <div class="mb-2">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="3" data-field="description"
                    oninput="updateDemoField(${demo.id}, 'description', this.value)">${demo.description || ''}</textarea>
            </div>
        </div>
    `;

    container.appendChild(demoDiv);
}

function addTalk() {
    const newTalk = { id: talkCounter++, name: '', description: '' };
    talks.push(newTalk);
    addTalkUI(newTalk);
    updateSVG();
    saveState();
}

function addDemo() {
    const newDemo = { id: demoCounter++, name: '', description: '' };
    demos.push(newDemo);
    addDemoUI(newDemo);
    updateSVG();
    saveState();
}

function removeTalk(id) {
    talks = talks.filter(t => t.id !== id);
    document.querySelector(`[data-talk-id="${id}"]`).remove();
    updateSVG();
    renumberTalks();
    saveState();
}

function removeDemo(id) {
    demos = demos.filter(d => d.id !== id);
    document.querySelector(`[data-demo-id="${id}"]`).remove();
    updateSVG();
    renumberDemos();
    saveState();
}

function renumberTalks() {
    document.querySelectorAll('[data-talk-id]').forEach((el, index) => {
        el.querySelector('h6').textContent = `Talk ${index + 1}`;
    });
}

function renumberDemos() {
    document.querySelectorAll('[data-demo-id]').forEach((el, index) => {
        el.querySelector('h6').textContent = `Demo ${index + 1}`;
    });
}

function updateTalkField(id, field, value) {
    const talk = talks.find(t => t.id === id);
    if (talk) {
        // Convert name to uppercase
        if (field === 'name') {
            value = value.toUpperCase();
            // Update the input field to show uppercase
            const input = document.querySelector(`[data-talk-id="${id}"] input[data-field="name"]`);
            if (input) {
                input.value = value;
            }
        }
        talk[field] = value;
        updateSVG();
        saveState();
    }
}

function updateDemoField(id, field, value) {
    const demo = demos.find(d => d.id === id);
    if (demo) {
        // Convert name to uppercase
        if (field === 'name') {
            value = value.toUpperCase();
            // Update the input field to show uppercase
            const input = document.querySelector(`[data-demo-id="${id}"] input[data-field="name"]`);
            if (input) {
                input.value = value;
            }
        }
        demo[field] = value;
        updateSVG();
        saveState();
    }
}

function calculateItemHeight(description) {
    // Calculate height based on number of lines in description
    const lines = (description || '').split('\n').filter(l => l.trim().length > 0);
    const numLines = Math.max(lines.length, 1);

    // Height = name height + spacing + description lines + bottom margin
    return (LINE_HEIGHT *2) + (numLines * LINE_HEIGHT) + ITEM_BOTTOM_MARGIN;
}

function updateSVG() {
    const svgContainer = document.getElementById('svg-container');
    const gTalks = svgContainer.querySelector('#g_talks');
    const gDemos = svgContainer.querySelector('#g_demos');

    if (gTalks) {
        // Remove existing talk groups (but keep header, callout and footer)
        const talkGroups = Array.from(gTalks.children).filter(el => el.tagName === 'g' && !el.id);
        talkGroups.forEach(g => g.remove());

        // Create new talk groups with dynamic positioning
        let currentY = TALK_START_Y;
        talks.forEach((talk, index) => {
            const group = createTalkGroup(talk, currentY);

            // Insert before the open dork callout
            const callout = gTalks.querySelector('#callout_opendork');
            if (callout) {
                gTalks.insertBefore(group, callout);
            } else {
                gTalks.appendChild(group);
            }

            // Calculate height of this talk and add to current Y position
            currentY += calculateItemHeight(talk.description);
        });

        // Update Open Dork callout position (treat it as another item in the flow)
        const callout = gTalks.querySelector('#callout_opendork');
        if (callout) {
            callout.setAttribute('transform', `translate(0,${currentY})`);
            currentY += CALLOUT_HEIGHT + ITEM_BOTTOM_MARGIN;
        }

        // Update talks footer position (positioned after callout)
        const footer = gTalks.querySelector('#footer_talks');
        if (footer) {
            footer.setAttribute('y', `${currentY}px`);
        }
    }

    if (gDemos) {
        // Remove existing demo groups (but keep header, callout and footer)
        const demoGroups = Array.from(gDemos.children).filter(el => el.tagName === 'g' && !el.id);
        demoGroups.forEach(g => g.remove());

        // Create new demo groups with dynamic positioning
        let currentY = DEMO_START_Y;
        demos.forEach((demo, index) => {
            const group = createDemoGroup(demo, currentY);

            // Insert before the callout if it exists
            const callout = gDemos.querySelector('#callout_demos');
            if (callout) {
                gDemos.insertBefore(group, callout);
            } else {
                gDemos.appendChild(group);
            }

            // Calculate height of this demo and add to current Y position
            currentY += calculateItemHeight(demo.description);
        });

        // Update demos callout position (treat it as another item in the flow)
        const callout = gDemos.querySelector('#callout_demos');
        if (callout) {
            callout.setAttribute('transform', `translate(0,${currentY})`);
            currentY += CALLOUT_HEIGHT + ITEM_BOTTOM_MARGIN;
        }

        // Update demos footer position (positioned after callout)
        const footer = gDemos.querySelector('#footer_demos');
        if (footer) {
            footer.setAttribute('y', `${currentY}px`);
        }
    }
}

function createTalkGroup(talk, yPos) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(0,${yPos})`);

    // Name element
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', '0px');
    nameText.setAttribute('y', '0px');
    nameText.setAttribute('text-decoration', 'underline');
    nameText.setAttribute('style', "font-family:'ChicagoFLF';font-weight:500;font-size:41.667px;");
    nameText.textContent = talk.name || '';

    // Description element
    const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    descText.setAttribute('x', '0px');
    descText.setAttribute('y', '45.83px');
    descText.setAttribute('style', "font-family:'ChicagoFLF';font-weight:500;font-size:41.667px;");

    const lines = (talk.description || '').split('\n');
    lines.forEach((line, index) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '0px');
        tspan.setAttribute('dy', index === 0 ? '0' : '1.1em');
        tspan.textContent = line;
        descText.appendChild(tspan);
    });

    group.appendChild(nameText);
    group.appendChild(descText);

    return group;
}

function createDemoGroup(demo, yPos) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(0,${yPos})`);

    // Name element
    const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    nameText.setAttribute('x', '0px');
    nameText.setAttribute('y', '0px');
    nameText.setAttribute('text-decoration', 'underline');
    nameText.setAttribute('style', "font-family:'ChicagoFLF';font-weight:500;font-size:41.667px;");
    nameText.textContent = demo.name || '';

    // Description element
    const descText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    descText.setAttribute('x', '0px');
    descText.setAttribute('y', '45.83px');
    descText.setAttribute('style', "font-family:'ChicagoFLF';font-weight:500;font-size:41.667px;");

    const lines = (demo.description || '').split('\n');
    lines.forEach((line, index) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', '0px');
        tspan.setAttribute('dy', index === 0 ? '0' : '1.1em');
        tspan.textContent = line;
        descText.appendChild(tspan);
    });

    group.appendChild(nameText);
    group.appendChild(descText);

    return group;
}

function rgbToHex(rgb) {
    // Convert rgb(r, g, b) to hex
    if (rgb.startsWith('#')) return rgb;

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';

    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);

    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function setupSVGUpdateListeners() {
    const svgContainer = document.getElementById('svg-container');

    // Handle hero image upload
    document.getElementById('hero-image-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Read the file as a data URL
        const reader = new FileReader();
        reader.onload = function(event) {
            const dataURL = event.target.result;

            // Create a temporary image to get natural dimensions
            const tempImg = new Image();
            tempImg.onload = function() {
                // Find the hero image group
                const heroImage = svgContainer.querySelector('#hero_image');
                if (!heroImage) {
                    console.error('Hero image group not found');
                    return;
                }

                // Get the original dimensions and position
                const existingUse = heroImage.querySelector('use');
                const originalX = parseFloat(existingUse ? existingUse.getAttribute('x') : '241');
                const originalY = parseFloat(existingUse ? existingUse.getAttribute('y') : '107');
                const originalWidth = parseFloat(existingUse ? existingUse.getAttribute('width') : '2003');
                const originalHeight = parseFloat(existingUse ? existingUse.getAttribute('height') : '1320');

                // Calculate dimensions to show full height
                const imageAspectRatio = tempImg.naturalWidth / tempImg.naturalHeight;
                const originalAspectRatio = originalWidth / originalHeight;

                let newWidth, newHeight;

                // Use the uploaded image's full height
                newHeight = tempImg.naturalHeight;

                // Scale width based on original width and aspect ratio
                // If image is wider than original aspect, scale to fit width
                // If image is taller, scale width proportionally
                if (imageAspectRatio >= originalAspectRatio) {
                    // Image is wider or same aspect - fit to original width
                    newWidth = originalWidth;
                    newHeight = originalWidth / imageAspectRatio;
                } else {
                    // Image is taller - show full height, scale width
                    newHeight = originalHeight;
                    newWidth = originalHeight * imageAspectRatio;
                }

                // Clear existing content
                heroImage.innerHTML = '';

                // Create new image element
                const newImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                newImage.setAttribute('x', originalX.toString());
                newImage.setAttribute('y', originalY.toString());
                newImage.setAttribute('width', newWidth.toString());
                newImage.setAttribute('height', newHeight.toString());
                newImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', dataURL);
                newImage.setAttribute('preserveAspectRatio', 'none'); // Don't crop, use calculated dimensions

                // Add to group
                heroImage.appendChild(newImage);
            };

            tempImg.src = dataURL;
        };

        reader.readAsDataURL(file);
    });

    // Update accent color 1 (logotype and callout rects)
    document.getElementById('accent-color-1').addEventListener('input', function() {
        const color = this.value;

        // Update logotype
        const logotype = svgContainer.querySelector('#g_dorkbot_logotype');
        if (logotype) {
            const paths = logotype.querySelectorAll('path');
            paths.forEach(path => {
                path.style.fill = color;
            });
        }

        // Update callout rectangles
        const rects = svgContainer.querySelectorAll('.r_hilite');
        rects.forEach(rect => {
            rect.style.fill = color;
        });

        saveState();
    });

    // Update accent color 2 (edition number)
    document.getElementById('accent-color-2').addEventListener('input', function() {
        const editionEl = svgContainer.querySelector('#edition_number');
        if (editionEl) {
            editionEl.style.fill = this.value;
        }
        saveState();
    });

    // Update edition number
    document.getElementById('edition-number').addEventListener('input', function() {
        const editionEl = svgContainer.querySelector('#edition_number');
        if (editionEl) {
            editionEl.textContent = this.value;
        }
        saveState();
    });

    // Update event details
    document.getElementById('event-details').addEventListener('input', function() {
        const gDetails = svgContainer.querySelector('#g_details');
        if (gDetails) {
            const lines = this.value.split('\n');
            const textElements = Array.from(gDetails.querySelectorAll('text'));
            const tspans = textElements.flatMap(t => Array.from(t.querySelectorAll('tspan')));

            tspans.forEach((tspan, index) => {
                if (index < lines.length) {
                    tspan.textContent = lines[index];
                } else {
                    tspan.textContent = '';
                }
            });
        }
        saveState();
    });

    // Update talks footer
    document.getElementById('talks-footer').addEventListener('input', function() {
        const gTalks = svgContainer.querySelector('#g_talks');
        if (gTalks) {
            const footerText = gTalks.querySelector('#footer_talks');
            if (footerText) {
                footerText.textContent = this.value;
            }
        }
        saveState();
    });

    // Update demos footer
    document.getElementById('demos-footer').addEventListener('input', function() {
        const gDemos = svgContainer.querySelector('#g_demos');
        if (gDemos) {
            const footerText = gDemos.querySelector('#footer_demos');
            if (footerText) {
                footerText.textContent = this.value;
            }
        }
        saveState();
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

        pdf.save('dorkbot-manchester-poster.pdf');

    } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
    }
}

// Load SVG when page loads
document.addEventListener('DOMContentLoaded', loadSVGAndPopulateFields);
