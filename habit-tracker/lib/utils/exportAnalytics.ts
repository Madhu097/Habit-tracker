import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { DailyHabitView } from '@/types';

interface ExportData {
    habits: DailyHabitView[];
    weeklyData: any[];
    monthlyData: any[];
    insights: {
        totalHabits: number;
        activeHabits: number;
        totalCompleted: number;
        totalMissed: number;
        overallCompletionRate: number;
        currentWeekCompletion: number;
        currentMonthCompletion: number;
        bestStreak: number;
        mostConsistentHabit: string;
        improvementTrend: 'up' | 'down' | 'stable';
        averageDaily: number;
        perfectDays: number;
    };
}

// Export to Excel
export const exportToExcel = (data: ExportData) => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        ['Habit Tracker Analytics Report'],
        ['Generated on:', format(new Date(), 'PPpp')],
        [''],
        ['Overall Statistics'],
        ['Total Habits', data.insights.totalHabits],
        ['Active Habits', data.insights.activeHabits],
        ['Total Completed', data.insights.totalCompleted],
        ['Total Missed', data.insights.totalMissed],
        ['Overall Completion Rate', `${data.insights.overallCompletionRate}%`],
        ['Current Week Completion', `${data.insights.currentWeekCompletion}%`],
        ['Current Month Completion', `${data.insights.currentMonthCompletion}%`],
        ['Best Streak', `${data.insights.bestStreak} days`],
        ['Average Daily Completions', data.insights.averageDaily],
        ['Perfect Days', data.insights.perfectDays],
        ['Performance Trend', data.insights.improvementTrend],
        ['Most Consistent Habit', data.insights.mostConsistentHabit],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

    // Habits Sheet
    const habitsData = [
        ['Habit Name', 'Description', 'Frequency', 'Current Streak', 'Longest Streak', 'Completion Rate', 'Total Completed', 'Total Missed', 'Status'],
        ...data.habits.map(h => [
            h.name || '',
            h.description || '',
            h.frequency?.type || 'daily',
            h.stats?.currentStreak || 0,
            h.stats?.longestStreak || 0,
            `${h.stats?.completionRate || 0}%`,
            h.stats?.totalCompleted || 0,
            h.stats?.totalMissed || 0,
            h.todayLog?.status || 'pending'
        ])
    ];
    const habitsSheet = XLSX.utils.aoa_to_sheet(habitsData);
    XLSX.utils.book_append_sheet(wb, habitsSheet, 'Habits');

    // Weekly Performance Sheet
    if (data.weeklyData.length > 0) {
        const weeklyDataFormatted = [
            ['Date', 'Completed', 'Missed', 'Total', 'Completion Rate'],
            ...data.weeklyData.map(w => {
                const total = w.completed + w.missed;
                const rate = total > 0 ? Math.round((w.completed / total) * 100) : 0;
                return [
                    format(new Date(w.date), 'MMM dd, yyyy'),
                    w.completed,
                    w.missed,
                    total,
                    `${rate}%`
                ];
            })
        ];
        const weeklySheet = XLSX.utils.aoa_to_sheet(weeklyDataFormatted);
        XLSX.utils.book_append_sheet(wb, weeklySheet, 'Weekly Performance');
    }

    // Monthly Trends Sheet
    if (data.monthlyData.length > 0) {
        const monthlyDataFormatted = [
            ['Month', 'Completed', 'Missed', 'Total', 'Completion Rate'],
            ...data.monthlyData.map(m => [
                format(new Date(m.month + '-01'), 'MMMM yyyy'),
                m.completed,
                m.missed,
                m.completed + m.missed,
                `${m.completionRate}%`
            ])
        ];
        const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyDataFormatted);
        XLSX.utils.book_append_sheet(wb, monthlySheet, 'Monthly Trends');
    }

    // Download
    XLSX.writeFile(wb, `Habit_Tracker_Analytics_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

// Export to CSV
export const exportToCSV = (data: ExportData) => {
    const csvRows: string[] = [];

    // Header
    csvRows.push('Habit Tracker Analytics Report');
    csvRows.push(`Generated on: ${format(new Date(), 'PPpp')}`);
    csvRows.push('');

    // Summary
    csvRows.push('Overall Statistics');
    csvRows.push(`Total Habits,${data.insights.totalHabits}`);
    csvRows.push(`Active Habits,${data.insights.activeHabits}`);
    csvRows.push(`Total Completed,${data.insights.totalCompleted}`);
    csvRows.push(`Total Missed,${data.insights.totalMissed}`);
    csvRows.push(`Overall Completion Rate,${data.insights.overallCompletionRate}%`);
    csvRows.push(`Current Week Completion,${data.insights.currentWeekCompletion}%`);
    csvRows.push(`Current Month Completion,${data.insights.currentMonthCompletion}%`);
    csvRows.push(`Best Streak,${data.insights.bestStreak} days`);
    csvRows.push(`Average Daily Completions,${data.insights.averageDaily}`);
    csvRows.push(`Perfect Days,${data.insights.perfectDays}`);
    csvRows.push(`Performance Trend,${data.insights.improvementTrend}`);
    csvRows.push(`Most Consistent Habit,${data.insights.mostConsistentHabit}`);
    csvRows.push('');

    // Habits
    csvRows.push('Habits Details');
    csvRows.push('Name,Description,Frequency,Current Streak,Longest Streak,Completion Rate,Total Completed,Total Missed,Status');
    data.habits.forEach(h => {
        csvRows.push(`"${h.name || ''}","${h.description || ''}",${h.frequency?.type || 'daily'},${h.stats?.currentStreak || 0},${h.stats?.longestStreak || 0},${h.stats?.completionRate || 0}%,${h.stats?.totalCompleted || 0},${h.stats?.totalMissed || 0},${h.todayLog?.status || 'pending'}`);
    });
    csvRows.push('');

    // Weekly Performance
    if (data.weeklyData.length > 0) {
        csvRows.push('Weekly Performance');
        csvRows.push('Date,Completed,Missed,Total,Completion Rate');
        data.weeklyData.forEach(w => {
            const total = w.completed + w.missed;
            const rate = total > 0 ? Math.round((w.completed / total) * 100) : 0;
            csvRows.push(`${format(new Date(w.date), 'MMM dd yyyy')},${w.completed},${w.missed},${total},${rate}%`);
        });
        csvRows.push('');
    }

    // Monthly Trends
    if (data.monthlyData.length > 0) {
        csvRows.push('Monthly Trends');
        csvRows.push('Month,Completed,Missed,Total,Completion Rate');
        data.monthlyData.forEach(m => {
            csvRows.push(`${format(new Date(m.month + '-01'), 'MMMM yyyy')},${m.completed},${m.missed},${m.completed + m.missed},${m.completionRate}%`);
        });
    }

    // Download
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Habit_Tracker_Analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
};

// Export to PDF
export const exportToPDF = (data: ExportData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Habit Tracker Analytics Report', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Statistics', 14, yPos);
    yPos += 8;

    const summaryData = [
        ['Total Habits', data.insights.totalHabits.toString()],
        ['Active Habits', data.insights.activeHabits.toString()],
        ['Total Completed', data.insights.totalCompleted.toString()],
        ['Total Missed', data.insights.totalMissed.toString()],
        ['Overall Completion Rate', `${data.insights.overallCompletionRate}%`],
        ['Current Week Completion', `${data.insights.currentWeekCompletion}%`],
        ['Current Month Completion', `${data.insights.currentMonthCompletion}%`],
        ['Best Streak', `${data.insights.bestStreak} days`],
        ['Average Daily Completions', data.insights.averageDaily.toString()],
        ['Perfect Days', data.insights.perfectDays.toString()],
        ['Performance Trend', data.insights.improvementTrend],
        ['Most Consistent Habit', data.insights.mostConsistentHabit],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        margin: { left: 14, right: 14 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Habits Table
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Habits Details', 14, yPos);
    yPos += 8;

    const habitsTableData = data.habits.map(h => [
        h.name || '',
        h.frequency?.type || 'daily',
        (h.stats?.currentStreak || 0).toString(),
        (h.stats?.longestStreak || 0).toString(),
        `${h.stats?.completionRate || 0}%`,
        (h.stats?.totalCompleted || 0).toString(),
        (h.stats?.totalMissed || 0).toString(),
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Habit', 'Frequency', 'Current Streak', 'Best Streak', 'Rate', 'Completed', 'Missed']],
        body: habitsTableData,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94], textColor: 255 },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Weekly Performance
    if (data.weeklyData.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Weekly Performance', 14, yPos);
        yPos += 8;

        const weeklyTableData = data.weeklyData.map(w => {
            const total = w.completed + w.missed;
            const rate = total > 0 ? Math.round((w.completed / total) * 100) : 0;
            return [
                format(new Date(w.date), 'MMM dd, yyyy'),
                w.completed.toString(),
                w.missed.toString(),
                total.toString(),
                `${rate}%`
            ];
        });

        autoTable(doc, {
            startY: yPos,
            head: [['Date', 'Completed', 'Missed', 'Total', 'Rate']],
            body: weeklyTableData,
            theme: 'grid',
            headStyles: { fillColor: [168, 85, 247], textColor: 255 },
            margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Monthly Trends
    if (data.monthlyData.length > 0) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Monthly Trends', 14, yPos);
        yPos += 8;

        const monthlyTableData = data.monthlyData.map(m => [
            format(new Date(m.month + '-01'), 'MMMM yyyy'),
            m.completed.toString(),
            m.missed.toString(),
            (m.completed + m.missed).toString(),
            `${m.completionRate}%`
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Month', 'Completed', 'Missed', 'Total', 'Rate']],
            body: monthlyTableData,
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68], textColor: 255 },
            margin: { left: 14, right: 14 },
        });
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Download
    doc.save(`Habit_Tracker_Analytics_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
