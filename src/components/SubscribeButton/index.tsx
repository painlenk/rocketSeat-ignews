import { signIn, useSession } from "next-auth/react";
import { api } from "../../services/api";
import { getStripeJs } from "../../services/stripe-js";
import styles from "./styles.module.scss";

interface SubscribeButton {
  priceId: string
}

export  function SubscribeButton({priceId} : SubscribeButton) {
  const {data : session} = useSession() // ver oque ta acontecendo
  //console.log("session data --> ",session)

  const  handleSubscribe = async () => {
    if(!session) {
      signIn('github')
      return
    }

    try {
      const response = await api.post('/subscribe')
      const {sessionId} = response.data
      const stripe = await getStripeJs()

      await stripe.redirectToCheckout({sessionId})
      
    } catch(e) {
      console.log('error --> ', e)
      alert(e.message)
    }
    
  }
  return (
    <button 
      type="button" 
      className={styles.subscribeButton}
      onClick={handleSubscribe}
      >
      Subscribe now
    </button>
  )
}
