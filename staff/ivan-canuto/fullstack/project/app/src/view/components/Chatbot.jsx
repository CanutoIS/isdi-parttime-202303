import { useEffect, useState } from "react"
import { Container, Button, SpeechBubble, Loader } from "../library"
import { useAppContext, useHandleErrors } from "../hooks"
import { askForResponse, retrieveConversation, storeInputInDB, generateConversation, generateSummary, createPost } from "../../logic"
import { context } from "../../ui"

export default function Chatbot({ lastPostsUpdate, setPage, handleLastPostsUpdate }) {
    const handleErrors = useHandleErrors()
    const { navigate } = useAppContext()

    const [messages, setMessages] = useState([])
    const [valueToRender, setValueToRender] = useState(null)
    const [summary, setSummary] = useState(null)
    const [firstInput, setFirstInput] = useState(true)

    useEffect(() => {
        if(context.conversationId) {
            handleErrors(async () => {
                
                const conversation = await retrieveConversation(context.conversationId)

                setMessages([...conversation.messages])
            })
        }
        else setMessages([])

        setPage('Chatbot')

        console.log('Chatbot -> render')
    }, [lastPostsUpdate])

    useEffect(() => {
      setSummary(null)
    }, [context.conversationId])

    const handleSubmit = async event => {
        event.preventDefault()

        handleErrors(async () => {
            const userInput = typeof event.target.userInput !== 'undefined' ? event.target.userInput.value : event.target.value

            // let userInput
            // if(typeof event.target.userInput.value !== undefined) userInput = event.target.userInput.value
            // else userInput = event.target.value

            if (!userInput) return
            
            if (!context.conversationId) context.conversationId = await generateConversation(userInput)

            const newUserInput = {
                role: 'user',
                content: userInput
            }
            
            const loaderInput = {
                role: 'assistant',
                content: <Loader/>
            }

            const currentMessages = [...messages]

            currentMessages.push(newUserInput, loaderInput)
            
            setMessages(currentMessages)
            
            await storeInputInDB(context.conversationId, newUserInput)

            const messagesToAsk = [...currentMessages]

            messagesToAsk.pop()
            
            const response = await askForResponse(context.conversationId, messagesToAsk)
            
            setValueToRender(response.content)

            const voidMessage = { role: 'assistant', content: ''}

            setMessages([...messagesToAsk, voidMessage])
        })

        typeof event.target.userInput !== 'undefined' ? event.target.userInput.value = '' : event.target.value = ''
    }

    const renderTypeWriterText = () => {
        const text = valueToRender
        const conversationContainer = document.querySelector('.conversation-container')

        const speechBubbles = document.querySelectorAll('.speechBubble')
        const lastSpeechBubbleContainer = speechBubbles[speechBubbles.length - 1]
        const lastSpeechBubble = lastSpeechBubbleContainer.firstElementChild
        lastSpeechBubble.classList.add('blinking-cursor')

        let i = 0

        const interval = setInterval(() => {
            lastSpeechBubble.textContent += text.slice(i - 1, i)

            if (text.length === i) {
                clearInterval(interval)

                lastSpeechBubble.classList.remove('blinking-cursor')

                setValueToRender(null)

                handleLastPostsUpdate()
            }

            i++
            conversationContainer.scrollTop = conversationContainer.scrollHeight
        }, 20)
    }

    if(valueToRender) renderTypeWriterText(valueToRender)

    const handleGenerateSummary = async () => {
        console.log('generating summary')
        if(context.conversationId) {
            const summary = await generateSummary(context.conversationId)
            
            setSummary(summary)
        }
    }

    const handleKeyDown = event => {
        if(event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }

    const handleDeleteSummary = () => {
        setSummary(null)
    }

    const handleGeneratePost = content => {
        const postContent = content ? content : summary

        handleErrors(async () => {
            await createPost(postContent, context.conversationId)

            navigate('/')

            handleLastPostsUpdate()
        })
    }

    return <Container className={`chatbot fixed top-0 left-0 bg-[url(src/images/chatbot-3.1.jpg)] bg-fixed bg-center bg-cover overflow-scroll`}>
        <button className="fixed right-2 top-24 w-24 z-10 mt-2 bg-yellow-100 leading-tight border border-black flex justify-center" onClick={handleGenerateSummary}>Generate summary</button>
        
        <section className={`conversation-container absolute top-24 w-full  ${!summary ? 'bottom-32' : ''} overflow-scroll`}>
            <div className='w-full flex justify-start'>
                <p className="p-4 mx-4 my-2 rounded-lg bg-green-300 rounded-tl-none">Hello! How can I help you?</p>
            </div>
            {messages && messages.map((message, index) => 
                <SpeechBubble
                    key={index}
                    role={message.role}
                    content={message.content}
                    handleGeneratePost={handleGeneratePost}
                />
            )}
            {summary && <div className="flex flex-col items-center gap-2 bg-red-300 rounded-lg pt-4 mx-4 pb-2 my-2">
                <h1>Summary</h1>
                <SpeechBubble className='py-0 px-0'
                    role={'sumamry'}
                    content={summary}
                />
                <div className="flex justify-around p-2 gap-2">
                    <Button className="border border-black leading-tight" onClick={handleGeneratePost}>Create post with this summary</Button>
                    <Button className="border border-black leading-tight" onClick={handleGenerateSummary}>Generate another summary</Button>
                    <Button className="border border-black leading-tight" onClick={handleDeleteSummary}>Continue with conversation</Button>
                </div>
            </div>
            }
        </section>

        {!summary && <form className="border-black border-2 flex flex-row p-2 fixed bottom-4 gap-2" onSubmit={handleSubmit}>
            {/* <textarea className="w-72 p-4 focus:outline-none" name='userInput' placeholder='Send a message' /> */}
            <textarea className="w-72 p-4 focus:outline-none" name='userInput' placeholder='Send a message' autoFocus onKeyDown={handleKeyDown}/>
            <Button><span className="material-symbols-outlined">send</span></Button>
        </form>}
    </Container>
}