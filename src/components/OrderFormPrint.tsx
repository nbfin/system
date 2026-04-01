import React from 'react';
import { Quotation } from '../types';
import { formatCurrency } from '../lib/utils';
import { X, Printer, FileDown } from 'lucide-react';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, TextRun, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';

interface OrderFormPrintProps {
  items: Quotation[];
  onClose: () => void;
}

export default function OrderFormPrint({ items, onClose }: OrderFormPrintProps) {
  const totalAmount = items.reduce((sum, item) => sum + (item.amount * item.moq), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "自然美生物科技股份有限公司 報價單",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Spacer
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "廠 商：", bold: true })] }),
                        new Paragraph({ text: "（買方）" }),
                        new Paragraph({ children: [new TextRun({ text: "聯絡人：", bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: "電 話：", bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: "傳 真：", bold: true })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "主約名稱：", bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: "主約簽署日期：", bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: "負責業務：", bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: "電 話：", bold: true })] }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "訂購日期：", bold: true })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: "交貨日期：", bold: true })] }),
                        new Paragraph({ children: [new TextRun({ text: "交貨地點：", bold: true })] }),
                        new Paragraph({ text: "" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Spacer
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: "項次", alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: "料號", alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: "商品名稱", alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: "單價", alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: "數量", alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: "總價(含稅)", alignment: AlignmentType.CENTER })] }),
                  ],
                }),
                ...items.map((item, index) => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: (index + 1).toString(), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: item.partNumber, alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: item.productName })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.amount), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: item.moq.toString(), alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(item.amount * item.moq), alignment: AlignmentType.CENTER })] }),
                  ],
                })),
                new TableRow({
                  children: [
                    new TableCell({ columnSpan: 5, children: [new Paragraph({ text: "合計", alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ text: formatCurrency(totalAmount), alignment: AlignmentType.CENTER })] }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Spacer
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: "特別約定", alignment: AlignmentType.CENTER })] }),
                    new TableCell({
                      width: { size: 90, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ text: "1. 本清單所載之價格均以新台幣元/含稅計算。" }),
                        new Paragraph({ text: "" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Spacer
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ text: "自然美生物科技股份有限公司 簽章", alignment: AlignmentType.CENTER }),
                        new Paragraph({ text: "" }),
                        new Paragraph({ text: "" }),
                        new Paragraph({ text: "" }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({ text: "簽章", alignment: AlignmentType.CENTER }),
                        new Paragraph({ text: "" }),
                        new Paragraph({ text: "" }),
                        new Paragraph({ text: "" }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "報價單.docx");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-auto p-4 sm:p-8 print:p-0">
      {/* 操作按鈕 (列印時隱藏) */}
      <div className="fixed top-4 right-4 flex gap-2 print:hidden z-[110]">
        <button
          onClick={handleDownloadWord}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all"
        >
          <FileDown className="w-4 h-4" />
          下載 Word
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-lg hover:bg-emerald-700 transition-all"
        >
          <Printer className="w-4 h-4" />
          列印
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold shadow-lg hover:bg-slate-200 transition-all"
        >
          <X className="w-4 h-4" />
          關閉
        </button>
      </div>

      {/* 報價單主體 */}
      <div className="max-w-[800px] mx-auto bg-white text-black font-serif p-8 border border-slate-100 print:border-0 print:p-4">
        {/* 頂部編號 (手寫感) */}
        <div className="flex justify-end text-blue-600 font-mono text-xl mb-2 italic">
          <div className="text-right">
            <p className="min-h-[1.5em]"></p>
            <p className="min-h-[1.5em]"></p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold border-b-2 border-black inline-block pb-1">
            自然美生物科技股份有限公司 報價單
          </h1>
        </div>

        {/* 廠商與合約資訊 */}
        <div className="grid grid-cols-2 border-2 border-black">
          <div className="border-r-2 border-black p-2 space-y-1">
            <p><span className="font-bold">廠 商：</span></p>
            <p>（買方）</p>
            <p><span className="font-bold">聯絡人：</span></p>
            <p><span className="font-bold">電 話：</span></p>
            <p><span className="font-bold">傳 真：</span></p>
          </div>
          <div className="p-2 space-y-1">
            <p><span className="font-bold">主約名稱：</span></p>
            <p><span className="font-bold">主約簽署日期：</span></p>
            <p><span className="font-bold">負責業務：</span></p>
            <p><span className="font-bold">電 話：</span></p>
          </div>
        </div>

        {/* 日期與地點 */}
        <div className="grid grid-cols-2 border-x-2 border-b-2 border-black">
          <div className="border-r-2 border-black p-2 flex items-center">
            <p><span className="font-bold">訂購日期：</span></p>
          </div>
          <div className="p-2 space-y-1">
            <p><span className="font-bold">交貨日期：</span></p>
            <p><span className="font-bold">交貨地點：</span></p>
            <p className="min-h-[1.5em]"></p>
          </div>
        </div>

        {/* 商品資訊表格 */}
        <div className="mt-0">
          <div className="bg-slate-200 border-x-2 border-black text-center py-1 font-bold italic">
            商品資訊
          </div>
          <table className="w-full border-2 border-black text-sm text-center border-collapse">
            <thead>
              <tr className="bg-slate-300">
                <th className="border-2 border-black p-1 w-10 italic">項次</th>
                <th className="border-2 border-black p-1 w-24">料號</th>
                <th className="border-2 border-black p-1">商品名稱</th>
                <th className="border-2 border-black p-1 w-16">單價</th>
                <th className="border-2 border-black p-1 w-12">數量</th>
                <th className="border-2 border-black p-1 w-24">總價(含稅)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border-2 border-black p-1">{index + 1}</td>
                  <td className="border-2 border-black p-1">{item.partNumber}</td>
                  <td className="border-2 border-black p-1 text-left">{item.productName}</td>
                  <td className="border-2 border-black p-1">{formatCurrency(item.amount)}</td>
                  <td className="border-2 border-black p-1">{item.moq}</td>
                  <td className="border-2 border-black p-1">{formatCurrency(item.amount * item.moq)}</td>
                </tr>
              ))}
              {/* 補足空白行 (美觀) */}
              {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border-2 border-black p-1"></td>
                  <td className="border-2 border-black p-1"></td>
                  <td className="border-2 border-black p-1"></td>
                  <td className="border-2 border-black p-1"></td>
                  <td className="border-2 border-black p-1"></td>
                  <td className="border-2 border-black p-1"></td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan={5} className="border-2 border-black p-1 text-right pr-4 italic">合計</td>
                <td className="border-2 border-black p-1">{formatCurrency(totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 特別約定 */}
        <div className="flex border-x-2 border-b-2 border-black min-h-[100px]">
          <div className="w-10 border-r-2 border-black flex items-center justify-center font-bold p-2 text-center leading-tight">
            特別約定
          </div>
          <div className="flex-1 p-2 text-sm space-y-1">
            <p>1. 本清單所載之價格均以新台幣元/含稅計算。</p>
            <p className="min-h-[1.5em]"></p>
          </div>
        </div>

        {/* 簽章區 */}
        <div className="grid grid-cols-2 border-x-2 border-b-2 border-black">
          <div className="border-r-2 border-black p-2 min-h-[150px]">
            <p className="text-center font-bold mb-4">自然美生物科技股份有限公司 簽章</p>
            <div className="relative h-24 flex items-center justify-center">
              {/* 模擬印章 (列印時顯示) */}
              <div className="border-2 border-red-600 text-red-600 p-2 text-[10px] transform -rotate-12 opacity-80 font-bold hidden print:block">
                <p>自然美生物科技股份有限公司</p>
                <p>統一編號</p>
                <p className="text-lg">38434293</p>
                <p>負責人：廖尚文</p>
                <p>電話：2949-6663</p>
                <p>台北市中正區館前路42號2樓</p>
              </div>
            </div>
          </div>
          <div className="p-2 min-h-[150px]">
            <p className="text-center font-bold mb-4">簽章</p>
            <div className="relative h-24 flex items-center justify-center gap-4">
              {/* 廠商簽章區留空 */}
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] mt-4">
          1
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 1cm; }
        }
      `}} />
    </div>
  );
}
