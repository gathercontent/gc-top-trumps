const camelcaseKeys = require('camelcase-keys');
const { getAllTemplates, getStructure, getAllItems, getItemData } = require('../services');

async function createItemsByTemplateName({
  actions,
  createContentDigest,
  createNodeId,
  options,
}) {
   const { createNode } = actions
   const { userName, apiKey, projectId } = options

   const dataModels = await getAllTemplates(userName, apiKey, projectId).then(async res => {
      if(res && res.length) {
         const templates = await Promise.all(
            res
               .filter(template => template.number_of_items_using > 0)
               .map(template => getStructure(userName,apiKey, template)))

         return templates
      }

      return []
   })

   const items = await getAllItems(userName, apiKey, projectId).then(async itemsRes => {
      if(itemsRes && itemsRes.length) {
         const updatedItems = await Promise.all(itemsRes.map(item => getItemData(userName, apiKey, item).then(itemDataRes => {
            const itemDataModel = dataModels.find(el => el.id === itemDataRes.template_id)
            return itemDataModel ? ({
               id: itemDataRes.id,
               template_id: itemDataRes.template_id,
               template_name: itemDataModel.name,
               ...Object.keys(itemDataRes.content).reduce((acc, key) => {
                  const {label, field_type, metadata} = itemDataModel.fields.find(el => el.uuid === key)

                  if(label) {
                     const mergedItem = camelcaseKeys({
                        ...acc,
                        [label]: itemDataRes.content[key],
                        field_type,
                        metadata
                     })
                     return mergedItem
                  }
               }, {})
            }) : {}
         })))

         return updatedItems
      }

      return []
   })

   items.forEach(item => {
      if(Object.keys(item).length) {
         const nodeContent = JSON.stringify(item)
         const name = item.template_name.replace(/\s/g, '')
         const nodeMeta = {
            id: createNodeId(`gather-content-${item.id}`),
            parent: null,
            children: [],
            internal: {
               type: `GatherContent${name}`,
               content: nodeContent,
               contentDigest: createContentDigest(item)
            }
         }
         const node = Object.assign({}, item, nodeMeta)
         createNode(node)
      }
   })

   return;
}

exports.createItemsByTemplateName = createItemsByTemplateName;
