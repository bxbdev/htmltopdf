import { Component, ElementRef, ViewChild } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
applyPlugin(jsPDF);
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  @ViewChild('convertHTML', { static: true }) convertHTML!: ElementRef;

  title = 'htmlpdf';
  today = new Date();

  downloadPdf() {
    const content = this.convertHTML.nativeElement;

    html2canvas(content).then((canvas) => {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;

      //一页pdf显示html页面生成的canvas高度;
      var pageHeight = (contentWidth / 592.28) * 841.89;
      //未生成pdf的html页面高度
      var leftHeight = contentHeight;
      //页面偏移
      var position = 0;
      //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
      var imgWidth = 595.28;
      var imgHeight = (592.28 / contentWidth) * contentHeight;

      var pageData = canvas.toDataURL('image/jpeg', 1.0);

      var pdf = new jsPDF('p', 'pt', 'a4');

      //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //当内容未超过pdf一页显示的范围，无需分页
      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          //避免添加空白页
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`content-${this.today.getFullYear()}.pdf`);
    });
  }

  generate() {
    const content = this.convertHTML.nativeElement;

    html2canvas(content, {
      scale: window.devicePixelRatio * 3,
      useCORS: true,
    }).then((canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let canvasWidth = canvas.width;
      let canvasHeight = canvas.height;

      // 计算每页的高度，以及第一页的偏移量
      let imgHeight = (pdfWidth / canvasWidth) * canvasHeight;
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');

      // 第一页
      pdf.addImage(
        imgData,
        'PNG',
        0,
        position,
        pdfWidth,
        imgHeight,
        '',
        'FAST'
      );
      heightLeft -= pdfHeight;

      // 剩余页
      while (heightLeft >= 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          0,
          position,
          pdfWidth,
          imgHeight,
          '',
          'FAST'
        );
        heightLeft -= pdfHeight;
      }

      pdf.save(`convertedDocument-${this.today.getFullYear()}.pdf`);
    });
  }

  // generatePDF() {
  //   const table = document.getElementById('table') as HTMLTableElement;
  //   const doc = new jsPDF('p', 'px', 'a4');
  //   doc.text('Hello world!', 10, 10);
  //   doc.text('This is client-side Javascript, pumping out a PDF.', 10, 30);
  //   doc.text('This demo was made using jspdf.', 10, 50);
  //   const margin = 1;
  //   autoTable(doc, { html: table, startY: 70 });
  //   doc.save('a4.pdf');
  // }
}
