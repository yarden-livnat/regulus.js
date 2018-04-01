
export let config = {
  settings: {
    hasHeaders: true,
    constrainDragToContainer: true,
    reorderEnabled: true,
    selectionEnabled: true,
    popoutWholeStack: false,
    blockedPopoutsThrowError: true,
    closePopoutsOnUnload: true,
    showPopoutIcon: true,
    showMaximiseIcon: true,
    showCloseIcon: true
  },
  dimensions: {},
  content: [{
    type: 'row',
    content: [
      {
        type: 'column',
        width: 13,
        content: [
          {
            type: 'component',
            componentName: 'Partition',
            componentState: {},
            title: 'Partition'
          },
          {
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'Filtering',
                componentState: {},
                title: 'Filtering',
              },
              {
                type: 'component',
                componentName: 'Resample',
                componentState: {},
                title: 'Resample',
              },
              {
                type: 'component',
                componentName: 'Extrema',
                componentState: {},
                title: 'Extrema',
              }
            ]
          }
        ]
      },
      {
        type: 'column',
        content: [
          {
            type: 'component',
            componentName: 'Lifeline',
            componentState: {},
            title: 'Lifeline',
          },
          {
            type: 'component',
            componentName: 'Details',
            componentState: {},
            title: 'Details',
          }
        ]
      }
    ]
  }]
};