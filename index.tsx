<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DiffSlide - Image Comparison</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Custom slider thumb styles for the range input */
      input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 0;
        height: 0;
        background: transparent;
      }
      input[type=range]::-moz-range-thumb {
        width: 0;
        height: 0;
        border: 0;
        background: transparent;
      }
      input[type=range]:focus {
        outline: none;
      }
    </style>
    
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "lucide-react": "https://esm.sh/lucide-react@0.300.0",
        "gifenc": "https://esm.sh/gifenc@1.0.3"
      }
    }
    </script>
    
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

</head>
  <body class="bg-slate-950 text-slate-200 antialiased overflow-x-hidden selection:bg-indigo-500/30">
    <div id="root"></div>

    </body>
</html>
