document.addEventListener('DOMContentLoaded', () => {
    // Interactive CNN Grid Logic
    const gridContainer = document.getElementById('interactive-grid');
    const hoverFilter = document.getElementById('hover-filter');
    const outputText = document.getElementById('output-text');
    const mathDetails = document.getElementById('math-details');
    const stepItems = document.querySelectorAll('.step-item');
    
    const gridSize = 6;
    const filterSize = 3;
    let cells = [];
    
    // 3x3 Filter weights (Detector de bordes verticales simple)
    const filterWeights = [
        [1, 0, -1],
        [1, 0, -1],
        [1, 0, -1]
    ];
    
    if (gridContainer) {
        // Imagen mock de 6x6 (ej: una calle o borde en el centro)
        const imageData = [
            [0,0,1,1,0,0],
            [0,0,1,1,0,0],
            [0,0,1,1,0,0],
            [0,1,1,1,1,0],
            [0,1,1,1,1,0],
            [0,0,0,0,0,0]
        ];

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.textContent = imageData[y][x];
                cell.dataset.x = x;
                cell.dataset.y = y;
                gridContainer.appendChild(cell);
                cells.push(cell);
            }
        }
        
        // Volver a añadir el div del hover-filter
        if(hoverFilter) gridContainer.appendChild(hoverFilter);
        
        gridContainer.addEventListener('mousemove', (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;
            
            const cx = parseInt(cell.dataset.x);
            const cy = parseInt(cell.dataset.y);
            
            // Mantener el filtro de 3x3 dentro del grid de 6x6
            const fx = Math.min(Math.max(cx - 1, 0), gridSize - filterSize);
            const fy = Math.min(Math.max(cy - 1, 0), gridSize - filterSize);
            
            if(hoverFilter) {
                hoverFilter.style.display = 'block';
                const leftPct = (fx / gridSize) * 100;
                const topPct = (fy / gridSize) * 100;
                hoverFilter.style.left = `calc(${leftPct}%)`;
                hoverFilter.style.top = `calc(${topPct}%)`;
            }
            
            cells.forEach(c => c.classList.remove('highlight'));
            
            let sum = 0;
            let mathString = "";
            
            for (let fy_offset = 0; fy_offset < filterSize; fy_offset++) {
                for (let fx_offset = 0; fx_offset < filterSize; fx_offset++) {
                    const px = fx + fx_offset;
                    const py = fy + fy_offset;
                    const targetCell = cells[py * gridSize + px];
                    targetCell.classList.add('highlight');
                    
                    const pixelVal = imageData[py][px];
                    const weightVal = filterWeights[fy_offset][fx_offset];
                    const product = pixelVal * weightVal;
                    sum += product;
                    
                    mathString += `<span style="display:inline-block; width:60px;">(${pixelVal}×${weightVal})</span> ` + (fx_offset===2 ? "" : " + ");
                }
                mathString += "<br>";
            }
            
            if(outputText) {
                outputText.innerHTML = `Resultado de Lupa = <strong style="color:var(--accent-purple); font-size:1.3rem;">${sum}</strong>`;
            }
            if(mathDetails) {
                mathDetails.innerHTML = `${mathString}`;
            }
            
            // Iluminar los pasos didácticos según el nivel de activación
            stepItems.forEach(item => item.classList.remove('active'));
            if(sum >= 2 && stepItems[1]) stepItems[1].classList.add('active'); // Borde fuerte
            else if(stepItems[0]) stepItems[0].classList.add('active'); // Piezas sueltas
        });
        
        gridContainer.addEventListener('mouseleave', () => {
            if(hoverFilter) hoverFilter.style.display = 'none';
            cells.forEach(c => c.classList.remove('highlight'));
            if(outputText) outputText.innerHTML = "Resultado: <strong style='font-size:1.3rem;'>0</strong>";
            if(mathDetails) mathDetails.textContent = "Acerca el mouse a la cuadrícula para ver el cálculo matemático en tiempo real...";
            stepItems.forEach(item => item.classList.remove('active'));
        });
    }
    
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
