export const templateHeader = `
<html lang="en">
  <body style="
    background-color: rgba(202, 199, 199, 0.4);
    overflow: hidden;
    height: 100%;
    font-size: 16px;
    font-family: sans-serif;
    text-align: center;
">
 <div
 style="margin: 0 auto; width: 400px; height: 100%; background-color: #fff; color: #000;box-shadow: 0 0 3px; " 
 >
     <div
style="text-align: left; height: 30%; border-bottom: 3px solid #e91e6361; padding: 20px 40px
        "
     >
    <h1
    >Sysbiol<span
    style="display: inline-block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #ca0dac;"
    >PGWAS</span></h1>
</div>
<div
 style="flex: 2; height: 40%; border-bottom: 3px solid #e91e6361; padding: 20px 40px; text-align: justify;
        "
>
`;

export const templateFooter = `
    </div>
 <div  style="height: 30%; padding: 20px 60px; text-align: center;
        ">
     <p>Copyright &copy; 2021 All Rights Reserved CUBRe</p>
 </div>
 </div>
</body>
</html>
`;

export const generalTemplate = (content: string) => {
  return `
    ${templateHeader}
        ${content}
    ${templateFooter}
  `;
};
