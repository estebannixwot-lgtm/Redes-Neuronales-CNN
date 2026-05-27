document.addEventListener('DOMContentLoaded', () => {
    // Interactive CNN Filter Animation Logic
    const filter = document.getElementById('moving-filter');
    const outputText = document.getElementById('output-text');
    const stepItems = document.querySelectorAll('.step-item');
    
    // Positions for the filter to move to simulate scanning
    const positions = [
        { top: '10%', left: '10%' },
        { top: '10%', left: '50%' },
        { top: '10%', left: '80%' },
        { top: '50%', left: '10%' },
        { top: '50%', left: '50%' },
        { top: '50%', left: '80%' },
        { top: '80%', left: '10%' },
        { top: '80%', left: '50%' },
        { top: '80%', left: '80%' },
    ];
    
    // Output messages to simulate extraction phases
    const messages = [
        "Fase 1: Extrayendo bordes y líneas...",
        "Fase 1: Identificando contrastes...",
        "Fase 2: Combinando formas geométricas...",
        "Fase 2: Detectando texturas urbanas...",
        "Fase 2: Analizando patrones de vegetación...",
        "Fase 3: Clasificando 'Área Residencial' [Confianza: 92%]",
        "Fase 3: Detectando 'Red de Carreteras' [Confianza: 88%]",
        "Fase 3: Clasificando 'Cuerpo de Agua' [Confianza: 95%]"
    ];

    let currentIndex = 0;

    function moveFilter() {
        if (!filter) return;
        
        // Move filter
        const pos = positions[currentIndex % positions.length];
        filter.style.top = pos.top;
        filter.style.left = pos.left;
        
        // Update text
        outputText.textContent = messages[currentIndex % messages.length];
        
        // Highlight active step based on message phase
        const phase = messages[currentIndex % messages.length].charAt(5); // get the number from "Fase X"
        
        stepItems.forEach(item => item.classList.remove('active'));
        if (phase === '1' && stepItems[0]) stepItems[0].classList.add('active');
        if (phase === '2' && stepItems[1]) stepItems[1].classList.add('active');
        if (phase === '3' && stepItems[2]) stepItems[2].classList.add('active');

        currentIndex++;
    }

    // Start scanning animation
    setInterval(moveFilter, 2000);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize Pan and Zoom for Mermaid Mindmap
    const initZoom = setInterval(() => {
        const svg = d3.select('.mermaid svg');
        if (!svg.empty()) {
            clearInterval(initZoom); // Stop checking once found
            
            // Remove constraints to allow proper scaling
            svg.attr('width', '100%').attr('height', '100%');
            svg.style('max-width', 'none');
            
            const inner = svg.select('g');
            const zoom = d3.zoom()
                .scaleExtent([0.5, 10])
                .on('zoom', (event) => {
                    inner.attr('transform', event.transform);
                });
                
            svg.call(zoom);
            
            // Center and scale mindmap initially
            const svgNode = svg.node();
            const width = svgNode.clientWidth || svgNode.getBoundingClientRect().width || 800;
            const height = svgNode.clientHeight || svgNode.getBoundingClientRect().height || 700;
            
            // A much larger initial scale
            const initialScale = 2.5; 
            
            try {
                const gBox = inner.node().getBBox();
                const x = (width - gBox.width * initialScale) / 2 - gBox.x * initialScale;
                const y = (height - gBox.height * initialScale) / 2 - gBox.y * initialScale;
                
                svg.call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(initialScale));
            } catch(e) {
                console.error("D3 Zoom fallback applied");
                svg.call(zoom.transform, d3.zoomIdentity.translate(width/4, height/4).scale(initialScale));
            }
        }
    }, 500); // Check every 500ms
});
