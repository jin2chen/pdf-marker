import { fabric } from "fabric";
import pdfjs from "pdfjs-dist/webpack";
import { PDFViewer as BasePDFViewer } from "pdfjs-dist/web/pdf_viewer";

let INSTANCE = null;

class PDFViewer extends BasePDFViewer {
  static instance(...args) {
    if (!INSTANCE) {
      INSTANCE = new PDFViewer(...args);
    }

    return INSTANCE;
  }

  constructor(...args) {
    super(...args);

    this.pagesRenderedCount = 0;
    this._bindEvents();
  }

  load(...args) {
    return pdfjs.getDocument(...args).promise.then(pdfDocument => {
      this.setDocument(pdfDocument);
    });
  }

  collect() {
    const items = [];
    if (this.pagesRenderedCount < this.pagesCount) {
      return items;
    }

    this.pagesRenderedCount = 0;
    for (let i = 0; i < this.pagesCount; ++i) {
      let page = this.getPageView(i);
      let json = JSON.stringify({
        id: page.id,
        viewport: page.viewport,
        outputScale: page.outputScale,
        dataUrl: page.canvas.toDataURL(),
        sections: []
      });
      items.push(JSON.parse(json));
      page.destroy();
    }

    return items;
  }

  _bindEvents() {
    this.eventBus.on("pagesinit", this._onPageInit.bind(this));
    this.eventBus.on("pagesloaded", this._onPagesLoaded.bind(this));
    this.eventBus.on("pagerendered", this._onPageRendered.bind(this));
  }

  _onPageInit(e) {
    // this.currentScaleValue = 72 / 96;
    // this.currentScaleValue = 1;
    // this.currentScaleValue = "page-width";
    // this.currentScaleValue = "page-fit";
  }

  _onPagesLoaded(e) {
    for (let i = 0; i < this.pagesCount; ++i) {
      let page = this.getPageView(i);

      page.onBeforeDraw = () => 0;
      if (page.renderingState === 0) {
        page.renderingQueue = null;
        page.draw();
      }
    }
  }

  _onPageRendered(e) {
    let page = e.source;
    let { canvas, outputScale } = page;
    let background = canvas.toDataURL("image/png");

    this.pagesRenderedCount++;
    if (this.pagesRenderedCount >= this.pagesCount) {
      this.eventBus.dispatch("pagesRenderCompleted");
    }
  }

  _scrollUpdate() {
    return;
  }

  _resetView() {
    super._resetView();
    this.pagesRenderedCount = 0;
  }
}

export default PDFViewer;
