import { NextApiRequest, NextApiResponse } from 'next'
import jsPDF from 'jspdf'
import path from 'path'
import fs from 'fs'
import { getLogoPath, LOGO_FALLBACK_TEXT } from '../../../lib/logo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { analysis, answers, sessionContext } = req.body

    if (!analysis) {
      return res.status(400).json({ error: 'Analysis is required' })
    }

    // Criar instância do jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Cores do tema cyberpunk
    const colors = {
      primary: '#FFCC33',    // ctd-yellow
      secondary: '#8BE9FD',  // ctd-holo
      background: '#000000', // ctd-bg
      text: '#FFFFFF',       // ctd-text
      muted: '#94A3B8'       // ctd-mute
    }

    // Configurações de página
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    // Background escuro (simulado com retângulos)
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Header com logo CTDHUB
    doc.setFillColor(255, 204, 51) // ctd-yellow
    doc.rect(0, 0, pageWidth, 35, 'F')

    // Tentar carregar e adicionar a logo
    try {
      const logoPath = getLogoPath()
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath)
        const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`
        
        // Adicionar logo (tamanho razoável: 50mm x 18mm)
        doc.addImage(logoBase64, 'PNG', margin, 5, 50, 18)
        
        // Subtitle ao lado da logo
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0) // Texto preto no header amarelo
        doc.text('BinnoAI Analysis Report', margin + 55, 15)
      } else {
        // Fallback: usar texto se logo não existir
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(24)
        doc.setTextColor(0, 0, 0)
        doc.text(LOGO_FALLBACK_TEXT, margin, 20)
        
        doc.setFontSize(12)
        doc.setFont('helvetica', 'normal')
        doc.text('BinnoAI Analysis Report', margin + 50, 20)
      }
    } catch (error) {
      console.log('Error loading logo, using text fallback:', error)
      // Fallback: usar texto se houver erro
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(0, 0, 0)
      doc.text(LOGO_FALLBACK_TEXT, margin, 20)
      
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('BinnoAI Analysis Report', margin + 50, 20)
    }

    // Data e hora
    const now = new Date()
    const dateStr = now.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text(`Generated on: ${dateStr}`, pageWidth - margin - 60, 15)

    yPosition = 55

    // Título principal
    doc.setTextColor(255, 204, 51) // ctd-yellow
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text('BinnoAI Comprehensive Analysis', margin, yPosition)
    yPosition += 15

    // Linha decorativa
    doc.setDrawColor(139, 233, 253) // ctd-holo
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Informações da sessão
    doc.setTextColor(255, 255, 255) // branco
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    
    const sessionInfo = [
      `Session Type: Web3 Project Assessment`,
      `Questions Answered: ${answers?.length || 0}`,
      `Experience Level: ${sessionContext?.experience_level || 'Not specified'}`,
      `Project Focus: ${sessionContext?.goal || 'General Web3 Development'}`
    ]

    sessionInfo.forEach(info => {
      doc.text(info, margin, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // Seção de análise
    doc.setTextColor(255, 204, 51) // ctd-yellow
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Analysis Results', margin, yPosition)
    yPosition += 10

    // Linha decorativa
    doc.setDrawColor(139, 233, 253) // ctd-holo
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    // Processar análise em chunks para não exceder a página
    doc.setTextColor(255, 255, 255) // branco
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    
    const analysisText = analysis.toString()
    const maxLineWidth = contentWidth - 10
    const lineHeight = 6
    
    // Dividir texto em linhas
    const lines = doc.splitTextToSize(analysisText, maxLineWidth)
    
    lines.forEach((line: string) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = margin
        
        // Repetir header em páginas subsequentes
        doc.setFillColor(255, 204, 51)
        doc.rect(0, 0, pageWidth, 25, 'F')
        
        // Tentar adicionar logo nas páginas subsequentes também
        try {
          const logoPath = getLogoPath()
          if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath)
            const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`
            doc.addImage(logoBase64, 'PNG', margin, 3, 35, 13) // Logo menor nas páginas subsequentes
            
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(12)
            doc.text('BinnoAI Analysis (continued)', margin + 40, 12)
          } else {
            doc.setTextColor(0, 0, 0)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(14)
            doc.text('CTD HUB - BinnoAI Analysis (continued)', margin, 15)
          }
        } catch (error) {
          doc.setTextColor(0, 0, 0)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(14)
          doc.text('CTD HUB - BinnoAI Analysis (continued)', margin, 15)
        }
        
        yPosition = 40
        
        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
      }
      
      doc.text(line, margin, yPosition)
      yPosition += lineHeight
    })

    // Footer
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      
      // Footer background
      doc.setFillColor(20, 20, 20)
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F')
      
      // Footer text
      doc.setTextColor(148, 163, 184) // ctd-muted
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Generated by CTD HUB BinnoAI - Advanced Web3 Analysis Platform', margin, pageHeight - 10)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10)
      
      // Website
      doc.setTextColor(139, 233, 253) // ctd-holo
      doc.text('ctdhub.io', pageWidth - margin - 20, pageHeight - 5)
    }

    // Converter para buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    
    // Configurar headers de resposta
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="ctdhub-binno-ai-analysis-${Date.now()}.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)
    
    res.status(200).send(pdfBuffer)
  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).json({ error: 'Failed to generate PDF', details: error })
  }
}