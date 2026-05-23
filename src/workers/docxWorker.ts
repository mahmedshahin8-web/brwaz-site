import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';

self.onmessage = async (e: MessageEvent) => {
  const { video_title, mood, finalVoiceScript, scenes } = e.data;

  try {
    const docChildren: any[] = [
      new Paragraph({
        children: [
          new TextRun({ text: "CONFIDENTIAL // BARWAZ INTELLIGENCE DOCUMENT", bold: true, size: 28 }),
        ],
      }),
      new Paragraph({ text: `PROJECT: ${video_title}` }),
      new Paragraph({ text: `TIMESTAMP: ${new Date().toISOString()}` }),
      new Paragraph({ text: `MOOD: ${mood}` }),
      new Paragraph({ text: "" }),
      new Paragraph({
        children: [
          new TextRun({ text: "THE SCRIPT & DIRECTOR CUES", bold: true, size: 24 }),
        ],
      }),
      new Paragraph({ text: "" }),
    ];

    if (scenes && scenes.length > 0) {
      // Create a 2-column table: Left for Visual Cues, Right for Voiceover
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: "Visual Cues (B-Roll / Camera)", bold: true })]})],
              width: { size: 40, type: WidthType.PERCENTAGE }
            }),
            new TableCell({ 
              children: [new Paragraph({ children: [new TextRun({ text: "Voiceover (Script)", bold: true })]})],
              width: { size: 60, type: WidthType.PERCENTAGE }
            }),
          ]
        }),
      ];

      // Add Opening Sketch if exists
      if (e.data.opening_sketch) {
         tableRows.push(
            new TableRow({
              children: [
                new TableCell({ 
                   children: [
                     new Paragraph({ text: `[OPENING HOOK]` }),
                     new Paragraph({ text: e.data.opening_sketch.visual_cue || "" }),
                     new Paragraph({ children: [new TextRun({ text: `Keywords: ${e.data.opening_sketch.b_roll_keywords || e.data.opening_sketch.b_roll_search_query || ""}`, italics: true })] })
                   ] 
                }),
                new TableCell({ children: [new Paragraph({ text: e.data.opening_sketch.voice_over || "", alignment: "right" })] }),
              ]
            })
          );
      }

      scenes.forEach((scene: any) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ 
                 children: [
                   new Paragraph({ text: `[${scene.asset_id}]` }),
                   new Paragraph({ text: scene.visual_cue || "" }),
                   new Paragraph({ children: [new TextRun({ text: `Keywords: ${scene.b_roll_keywords || scene.b_roll_search_query || ""}`, italics: true })] })
                 ] 
              }),
              new TableCell({ children: [new Paragraph({ text: scene.voice_over || "", alignment: "right" })] }),
            ]
          })
        );
      });

      docChildren.push(
        new Table({
          rows: tableRows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        })
      );
    } else {
      // Fallback if no scenes
      docChildren.push(...finalVoiceScript.split('\n').map((line: string) => new Paragraph({ text: line })));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docChildren,
      }],
    });

    const blob = await Packer.toBlob(doc);
    self.postMessage({ success: true, blob });
  } catch (error: any) {
    self.postMessage({ success: false, error: error.message });
  }
};
